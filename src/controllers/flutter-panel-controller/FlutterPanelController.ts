import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ADBBaseController } from '../adb-controller/ADBBaseController';
import { ADBConnection } from '../../domain/adb-wrapper';
import * as appStateKeys from '../../config/global-state-keys';
import { ConsoleInterface } from '../../domain/console/console-interface';
import { NetHelpers } from '../../domain/net-helpers';

interface Device {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'unauthorized';
  type: 'device' | 'emulator';
}

// FlutterCommand interface removed - using direct command mapping

export class FlutterPanelController extends ADBBaseController {
  private currentPanel: vscode.WebviewPanel | undefined;
  private connectedDevices: Device[] = [];
  private adbConnection: ADBConnection;

  constructor(context: vscode.ExtensionContext) {
    super(context);
    
    // Initialize ADB connection
    const consoleInterface = new ConsoleInterface();
    const netHelper = new NetHelpers();
    this.adbConnection = new ADBConnection(consoleInterface, context.globalState, netHelper);
  }

  async onInit() {
    console.log('🚀 FlutterPanelController: Initializing commands...')
    
    // Only register essential commands - remove all others
    this.registerCommand('flutterFly.openFlutterPanel', () => this.openFlutterPanel())
      .registerCommand('flutterFly.connectWirelessDevice', () => this.connectWirelessDevice())
      .registerCommand('flutterFly.showConnectedDevices', () => this.showConnectedDevices())
      .registerCommand('flutterFly.runFlutterDoctor', () => this.flutterDoctor())
      .registerCommand('flutterFly.getPackages', () => this.getPackages())
      .registerCommand('flutterFly.upgradePackages', () => this.upgradePackages())
      .registerCommand('flutterFly.cleanProject', () => this.cleanProject())
      .registerCommand('flutterFly.runFlutterApp', () => this.runFlutterApp())
      .registerCommand('flutterFly.buildAPK', () => this.buildAPK())
      .registerCommand('flutterFly.buildAppBundle', () => this.buildAAB())
    
    console.log('✅ FlutterPanelController: Essential commands registered successfully')
  }

  private async openFlutterPanel() {
    console.log('🚀 FlutterPanelController: Opening Flutter Fly Panel')
    
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (this.currentPanel) {
      console.log('📱 FlutterPanelController: Panel already exists, revealing...')
      this.currentPanel.reveal(column);
      return;
    }

    console.log('🆕 FlutterPanelController: Creating new webview panel...')
    this.currentPanel = vscode.window.createWebviewPanel(
      'flutterFlyPanel',
      '🚀 Flutter Fly - Wireless Debug & Run',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        enableCommandUris: true,
        localResourceRoots: [
          vscode.Uri.joinPath(this.context.extensionUri, 'media'),
          vscode.Uri.joinPath(this.context.extensionUri, 'src', 'webview'),
          vscode.Uri.file(path.join(this.context.extensionPath, 'media'))
        ],
        enableForms: true,
        enableFindWidget: true
      }
    );

    console.log('📝 FlutterPanelController: Setting webview HTML content...')
    this.currentPanel.webview.html = this.getWebviewContent(this.currentPanel);

    // Send a test message to the webview after a short delay to ensure it's loaded
    setTimeout(() => {
      if (this.currentPanel) {
        console.log('📤 FlutterPanelController: Sending test message to webview');
        this.currentPanel.webview.postMessage({
          command: 'addStatusMessage',
          message: '🔍 Test message from extension',
          type: 'info'
        });
      }
    }, 2000);

    this.currentPanel.webview.onDidReceiveMessage(
      async (message) => {
        console.log('📨 FlutterPanelController: Received message:', message)
        
        try {
          switch (message.command) {
            case 'connectDevice':
              console.log('🔗 FlutterPanelController: Connecting device...')
              await this.handleConnectDevice(message.ip, message.port);
              break;
            case 'runFlutterCommand':
              console.log('⚡ FlutterPanelController: Running Flutter command:', message.commandId)
              await this.handleFlutterCommand(message.commandId);
              break;
            case 'refreshDevices':
              console.log('🔄 FlutterPanelController: Refreshing devices...')
              await this.refreshConnectedDevices();
              break;
            case 'disconnectDevice':
              console.log('❌ FlutterPanelController: Disconnecting device...')
              await this.handleDisconnectDevice(message.deviceId);
              break;
            default:
              console.warn('⚠️ FlutterPanelController: Unknown message command:', message.command)
              break;
          }
        } catch (error) {
          console.error('❌ FlutterPanelController: Error handling message:', error)
          const errorMessage = error instanceof Error ? error.message : String(error)
          this.showErrorMessage(`Error handling message: ${errorMessage}`);
          
          // Send error to webview
          if (this.currentPanel) {
            this.currentPanel.webview.postMessage({
              command: 'addStatusMessage',
              message: `❌ Error: ${errorMessage}`,
              type: 'error'
            });
          }
        }
      }
    );

    this.currentPanel.onDidDispose(() => {
      console.log('🗑️ FlutterPanelController: Panel disposed')
      this.currentPanel = undefined;
    });

    // Initial device refresh
    console.log('🔄 FlutterPanelController: Performing initial device refresh...')
    await this.refreshConnectedDevices();
    
    console.log('✅ FlutterPanelController: Panel opened successfully')
  }

  private getWebviewContent(panel: vscode.WebviewPanel): string {
    // Get the absolute path to the media directory
    const mediaPath = path.join(this.context.extensionPath, 'media');
    console.log(`📂 Media directory path: ${mediaPath}`);
    
    // Create URIs for the CSS and JS files
    const styleUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(mediaPath, 'flutter-fly.css')));
    const scriptUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(mediaPath, 'flutter-fly.js')));
    
    console.log(`🔗 Style URI: ${styleUri}`);
    console.log(`🔗 Script URI: ${scriptUri}`);

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Flutter Fly - Wireless Debug & Run</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
        <link href="${styleUri}" rel="stylesheet">
    </head>
    <body>
        <div class="container-fluid">
            <!-- Header Section -->
            <div class="row header-section">
                <div class="col-12 text-center">
                    <h1 class="display-4 text-white mb-3">
                        <i class="fas fa-rocket"></i> Flutter Fly
                    </h1>
                    <p class="lead text-white-50">Wireless Debug & Run - Your Flutter Development Companion</p>
                    
                    <!-- Social Links -->
                    <div class="social-links mt-3">
                        <a href="https://github.com/jamalihassan0307" target="_blank" class="btn btn-outline-light btn-sm me-2">
                            <i class="fab fa-github"></i> GitHub
                        </a>
                        <a href="https://linkedin.com/in/jamalihassan0307" target="_blank" class="btn btn-outline-light btn-sm me-2">
                            <i class="fab fa-linkedin"></i> LinkedIn
                        </a>
                        <a href="https://jamalihassan0307.github.io" target="_blank" class="btn btn-outline-light btn-sm">
                            <i class="fas fa-globe"></i> Portfolio
                        </a>
                    </div>
                    
                    <!-- Developer Info -->
                    <div class="developer-info mt-3">
                        <small class="text-white-50">
                            <i class="fas fa-code"></i> Built with ❤️ by <strong>Jam Ali Hassan</strong>
                        </small>
                    </div>
                </div>
            </div>

            <div class="row">
                <!-- Left Sidebar - Device Management -->
                <div class="col-md-4 sidebar">
                    <div class="card device-card">
                        <div class="card-header bg-primary text-white">
                            <h5><i class="fas fa-mobile-alt"></i> Device Management</h5>
                        </div>
                        <div class="card-body">
                            <!-- Wireless Connection Form -->
                            <div class="connection-form mb-4">
                                <h6 class="text-primary">Connect Wireless Device</h6>
                                                                 <div class="input-group mb-2">
                                     <span class="input-group-text"><i class="fas fa-network-wired"></i></span>
                                     <input type="text" class="form-control" id="deviceIP" placeholder="Device IP Address" value="192.168.100.25">
                                 </div>
                                 <div class="input-group mb-3">
                                     <span class="input-group-text"><i class="fas fa-plug"></i></span>
                                     <input type="text" class="form-control" id="devicePort" placeholder="Port" value="42065">
                                 </div>
                                <button class="btn btn-success w-100" id="connectBtn">
                                    <i class="fas fa-link"></i> Connect Device
                                </button>
                            </div>

                            <!-- Connected Devices -->
                            <div class="connected-devices">
                                <h6 class="text-primary">Connected Devices</h6>
                                <div id="devicesList" class="devices-list">
                                    <div class="text-muted text-center py-3">
                                        <i class="fas fa-mobile-alt fa-2x mb-2"></i>
                                        <p>No devices connected</p>
                                    </div>
                                </div>
                                <button class="btn btn-outline-primary btn-sm w-100" id="refreshDevicesBtn">
                                    <i class="fas fa-sync-alt"></i> Refresh Devices
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="card mt-3">
                        <div class="card-header bg-info text-white">
                            <h6><i class="fas fa-bolt"></i> Quick Actions</h6>
                        </div>
                        <div class="card-body">
                            <div class="d-grid gap-2">
                                <button class="btn btn-outline-info btn-sm" onclick="flutterFly.executeFlutterCommand('runFlutterDoctor')">
                                    <i class="fas fa-stethoscope"></i> Flutter Doctor
                                </button>
                                <button class="btn btn-outline-info btn-sm" onclick="flutterFly.executeFlutterCommand('getPackages')">
                                    <i class="fas fa-download"></i> Get Packages
                                </button>
                                <button class="btn btn-outline-info btn-sm" onclick="flutterFly.executeFlutterCommand('upgradePackages')">
                                    <i class="fas fa-arrow-up"></i> Upgrade Packages
                                </button>
                                <button class="btn btn-outline-info btn-sm" onclick="flutterFly.executeFlutterCommand('cleanProject')">
                                    <i class="fas fa-broom"></i> Clean Project
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Content - Flutter Commands -->
                <div class="col-md-8 main-content">
                    <div class="row">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header bg-success text-white">
                                    <h5><i class="fas fa-play-circle"></i> Flutter Commands</h5>
                                </div>
                                <div class="card-body">
                                    <div class="row" id="flutterCommandsGrid">
                                        <!-- Essential Flutter Commands -->
                                        <div class="col-md-6 mb-3">
                                            <div class="card command-card h-100">
                                                <div class="card-body">
                                                    <h6><i class="fas fa-rocket text-primary"></i> Essential Commands</h6>
                                                    <div class="d-grid gap-2">
                                                        <button class="btn btn-outline-primary btn-sm" onclick="flutterFly.executeFlutterCommand('runApp')">
                                                            <i class="fas fa-play"></i> Run App
                                                        </button>
                                                        <button class="btn btn-outline-primary btn-sm" onclick="flutterFly.executeFlutterCommand('runFlutterDoctor')">
                                                            <i class="fas fa-stethoscope"></i> Flutter Doctor
                                                        </button>
                                                        <button class="btn btn-outline-primary btn-sm" onclick="flutterFly.executeFlutterCommand('getPackages')">
                                                            <i class="fas fa-download"></i> Get Packages
                                                        </button>
                                                        <button class="btn btn-outline-primary btn-sm" onclick="flutterFly.executeFlutterCommand('upgradePackages')">
                                                            <i class="fas fa-arrow-up"></i> Upgrade Packages
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Building Commands -->
                                        <div class="col-md-6 mb-3">
                                            <div class="card command-card h-100">
                                                <div class="card-body">
                                                    <h6><i class="fas fa-hammer text-success"></i> Building</h6>
                                                    <div class="d-grid gap-2">
                                                        <button class="btn btn-outline-success btn-sm" onclick="flutterFly.executeFlutterCommand('buildAPK')">
                                                            <i class="fas fa-mobile-alt"></i> Build APK
                                                        </button>
                                                        <button class="btn btn-outline-success btn-sm" onclick="flutterFly.executeFlutterCommand('buildAAB')">
                                                            <i class="fas fa-box"></i> Build AAB
                                                        </button>
                                                        <button class="btn btn-outline-warning btn-sm" onclick="flutterFly.executeFlutterCommand('cleanProject')">
                                                            <i class="fas fa-broom"></i> Clean Project
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                                                              <!-- Status Messages -->
                      <div class="row mt-3">
                          <div class="col-12">
                              <div class="card">
                                  <div class="card-header bg-info text-white">
                                      <h6><i class="fas fa-info-circle"></i> Status Messages</h6>
                                      <button class="btn btn-outline-light btn-sm float-end" id="clearStatusBtn">
                                          <i class="fas fa-trash"></i> Clear
                                      </button>
                                  </div>
                                  <div class="card-body">
                                      <div id="statusMessages" class="status-messages">
                                          <div class="text-muted text-center py-3">
                                              <i class="fas fa-bell fa-2x mb-2"></i>
                                              <p>Status messages will appear here</p>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                </div>
            </div>
        </div>

        <!-- Toast Notifications -->
        <div class="toast-container position-fixed bottom-0 end-0 p-3">
            <div id="successToast" class="toast" role="alert">
                <div class="toast-header bg-success text-white">
                    <i class="fas fa-check-circle me-2"></i>
                    <strong class="me-auto">Success</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body" id="successToastBody"></div>
            </div>
            <div id="errorToast" class="toast" role="alert">
                <div class="toast-header bg-danger text-white">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    <strong class="me-auto">Error</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body" id="errorToastBody"></div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        
        <!-- Inline script for debugging -->
        <script>
            console.log('🔍 Inline script executed - checking environment');
            window.addEventListener('DOMContentLoaded', () => {
                console.log('🔍 DOM content loaded');
                document.body.classList.add('js-loaded');
                
                // Check if vscode API is available
                if (typeof acquireVsCodeApi !== 'undefined') {
                    console.log('✅ VSCode API is available');
                    window.vscode = acquireVsCodeApi();
                } else {
                    console.error('❌ VSCode API is not available');
                    document.body.classList.add('no-vscode-api');
                }
                
                // Add status message directly
                const statusContainer = document.getElementById('statusMessages');
                if (statusContainer) {
                    statusContainer.innerHTML = '<div class="p-2 border-start border-3 border-info"><small class="text-muted">[Debug]</small> <span>Inline script executed</span></div>';
                }
            });
        </script>
        
        <!-- Main script -->
        <script>
            console.log('🔄 Loading main script from: ${scriptUri}');
        </script>
        <script src="${scriptUri}" onerror="console.error('❌ Failed to load script from: ${scriptUri}'); document.body.classList.add('script-error')"></script>
    </body>
    </html>`;
  }

  private async handleConnectDevice(ip: string, port: string) {
    console.log(`🔗 FlutterPanelController: handleConnectDevice called for ${ip}:${port}`)
    
    try {
      // Use actual ADB to connect to the device
      if (port) {
        await this.context.globalState.update(appStateKeys.lastUsedPort(), port);
      }
      if (ip) {
        await this.context.globalState.update(appStateKeys.lastUsedIP(), ip);
      }
      
      // Show connecting message
      if (this.currentPanel) {
        this.currentPanel.webview.postMessage({
          command: 'addStatusMessage',
          message: `🔄 Connecting to ${ip}:${port}...`,
          type: 'info'
        });
      }
      
      try {
        // Try to connect using ADB
        const result = await this.adbConnection.ConnectToDevice(ip, port);
        console.log(`ADB Connection result: ${result}`);
        
        // Create device object from successful connection
        const newDevice = {
          id: `${ip}:${port}`,
          name: `Device ${ip}:${port}`,
          status: 'online' as const,
          type: 'device' as const
        };

        // Check if device already exists
        const existingDevice = this.connectedDevices.find(d => d.id === newDevice.id);
        if (!existingDevice) {
          this.connectedDevices.push(newDevice);
          console.log(`✅ FlutterPanelController: Device ${ip}:${port} added to connected devices`);
          
          // Update the webview with new device list
          if (this.currentPanel) {
            this.currentPanel.webview.postMessage({
              command: 'updateDevices',
              devices: this.connectedDevices
            });
          }
          
          // Show success message
          vscode.window.showInformationMessage(result);
          
          // Update webview with success message
          if (this.currentPanel) {
            this.currentPanel.webview.postMessage({
              command: 'addStatusMessage',
              message: `✅ ${result}`,
              type: 'success'
            });
          }
        } else {
          console.log(`ℹ️ FlutterPanelController: Device ${ip}:${port} already connected`);
          vscode.window.showInformationMessage(`Device ${ip}:${port} is already connected`);
        }
      } catch (adbError) {
        // Handle ADB not found or connection errors
        if (adbError instanceof Error && adbError.message.includes('ADB not found')) {
          const result = await vscode.window.showErrorMessage(
            'ADB not found. Do you want to set a custom ADB path?',
            'Set ADB Path',
            'Cancel'
          );
          
          if (result === 'Set ADB Path') {
            vscode.commands.executeCommand('flutterFly.setCustomADBPath');
          }
          
          throw new Error('ADB not found. Please install Android SDK or set a custom ADB path.');
        } else {
          throw adbError;
        }
      }
      
      console.log(`✅ FlutterPanelController: Device connection handled for ${ip}:${port}`);
      
      // Refresh device list to show actual connected devices
      await this.refreshConnectedDevices();
      
    } catch (error) {
      console.error(`❌ FlutterPanelController: Failed to handle connection for ${ip}:${port}:`, error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.showErrorMessage(`Failed to connect: ${errorMessage}`);
      
      // Update webview with error message
      if (this.currentPanel) {
        this.currentPanel.webview.postMessage({
          command: 'addStatusMessage',
          message: `❌ Failed to connect: ${errorMessage}`,
          type: 'error'
        });
      }
    }
  }

  private async handleFlutterCommand(commandId: string) {
    console.log(`⚡ FlutterPanelController: handleFlutterCommand called for command ID: ${commandId}`)
    
    try {
      let commandToExecute = '';
      let commandName = '';
      
      // Map command IDs to actual commands
      switch (commandId) {
        case 'runFlutterDoctor':
          commandToExecute = 'flutter doctor';
          commandName = 'Flutter Doctor';
          break;
        case 'getPackages':
          commandToExecute = 'flutter pub get';
          commandName = 'Get Packages';
          break;
        case 'upgradePackages':
          commandToExecute = 'flutter pub upgrade';
          commandName = 'Upgrade Packages';
          break;
        case 'cleanProject':
          commandToExecute = 'flutter clean';
          commandName = 'Clean Project';
          break;
        case 'runApp':
          commandToExecute = 'flutter run';
          commandName = 'Run Flutter App';
          break;
        case 'buildAPK':
          commandToExecute = 'flutter build apk';
          commandName = 'Build APK';
          break;
        case 'buildAAB':
          commandToExecute = 'flutter build appbundle';
          commandName = 'Build AAB';
          break;
        default:
          console.log(`❌ FlutterPanelController: Unknown command ID: ${commandId}`)
          this.showErrorMessage(`Unknown command: ${commandId}`);
          return;
      }

      console.log(`🚀 FlutterPanelController: Executing command: ${commandName} (${commandToExecute})`)
      
      // First send a message to the webview that we're processing the command
      if (this.currentPanel) {
        console.log(`📤 FlutterPanelController: Sending processing message to webview`);
        this.currentPanel.webview.postMessage({
          command: 'addStatusMessage',
          message: `⏳ Processing command: ${commandName}`,
          type: 'info'
        });
      }
      
      // Create a new terminal and execute the command directly
      try {
        const terminal = vscode.window.createTerminal(`Flutter Fly - ${commandName}`);
        terminal.show();
        
        // Execute the command with a small delay to ensure the terminal is ready
        setTimeout(() => {
          terminal.sendText(commandToExecute);
          console.log(`✅ FlutterPanelController: Command sent to terminal: ${commandToExecute}`);
        }, 500);
        
        console.log(`✅ FlutterPanelController: Terminal created for command: ${commandName}`);
        this.showSuccessMessage(`Executed: ${commandName}`);
        
        // Update webview with success message
        if (this.currentPanel) {
          console.log(`📤 FlutterPanelController: Sending success message to webview`);
          this.currentPanel.webview.postMessage({
            command: 'addStatusMessage',
            message: `✅ Successfully executed: ${commandName}`,
            type: 'success'
          });
        }
      } catch (terminalError) {
        console.error(`❌ FlutterPanelController: Terminal error:`, terminalError);
        const errorMessage = terminalError instanceof Error ? terminalError.message : String(terminalError)
        throw new Error(`Failed to create terminal: ${errorMessage}`);
      }
    } catch (error) {
      console.error(`❌ FlutterPanelController: Failed to execute command ${commandId}:`, error)
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.showErrorMessage(`Failed to execute command: ${errorMessage}`);
      
      // Update webview with error message
      if (this.currentPanel) {
        console.log(`📤 FlutterPanelController: Sending error message to webview`);
        this.currentPanel.webview.postMessage({
          command: 'addStatusMessage',
          message: `❌ Failed to execute: ${errorMessage}`,
          type: 'error'
        });
      }
    }
  }
  
  // Method removed - using direct terminal execution in handleFlutterCommand

  private async handleDisconnectDevice(deviceId: string) {
    console.log(`❌ FlutterPanelController: handleDisconnectDevice called for device: ${deviceId}`)
    
    try {
      // Use ADB connection to disconnect the device
      await this.adbConnection.DisconnectFromAllDevices();
      
      // Remove the device from our list
      this.connectedDevices = this.connectedDevices.filter(d => d.id !== deviceId);
      
      // Update the UI
      if (this.currentPanel) {
        this.currentPanel.webview.postMessage({
          command: 'updateDevices',
          devices: this.connectedDevices
        });
        
        this.currentPanel.webview.postMessage({
          command: 'addStatusMessage',
          message: `✅ Disconnected device: ${deviceId}`,
          type: 'success'
        });
      }
      
      console.log(`✅ FlutterPanelController: Successfully disconnected device: ${deviceId}`)
      this.showSuccessMessage(`Disconnected device: ${deviceId}`);
      
      // Refresh device list to show actual connected devices
      await this.refreshConnectedDevices();
    } catch (error) {
      console.error(`❌ FlutterPanelController: Failed to disconnect device:`, error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.showErrorMessage(`Failed to disconnect device: ${errorMessage}`);
      
      if (this.currentPanel) {
        this.currentPanel.webview.postMessage({
          command: 'addStatusMessage',
          message: `❌ Failed to disconnect device: ${errorMessage}`,
          type: 'error'
        });
      }
    }
  }

  private async refreshConnectedDevices() {
    console.log('🔄 FlutterPanelController: refreshConnectedDevices called')
    
    try {
      try {
        // Get actual connected devices from ADB
        const deviceList = await this.adbConnection.FindConnectedDevices();
        console.log('Found devices:', deviceList);
        
        // Clear current devices list
        this.connectedDevices = [];
        
        // Process each device from ADB
        for (const deviceString of deviceList) {
          // Extract device ID and status from ADB output
          const parts = deviceString.split('|');
          if (parts.length >= 1) {
            const deviceId = parts[0].trim();
            const deviceStatus = 'online'; // Default to online
            
            this.connectedDevices.push({
              id: deviceId,
              name: `Device ${deviceId}`,
              status: deviceStatus as 'online' | 'offline' | 'unauthorized',
              type: 'device'
            });
          }
        }
        
        console.log(`📱 FlutterPanelController: Found ${this.connectedDevices.length} connected devices`);
      } catch (adbError) {
        // Handle ADB not found error gracefully
        if (adbError instanceof Error && adbError.message.includes('ADB not found')) {
          console.warn('ADB not found when refreshing devices. Using stored device list.');
          
          // Show a warning in the status messages
          if (this.currentPanel) {
            this.currentPanel.webview.postMessage({
              command: 'addStatusMessage',
              message: '⚠️ ADB not found. Device list may be incomplete.',
              type: 'warning'
            });
          }
        } else {
          // For other errors, throw them to be caught by the outer try/catch
          throw adbError;
        }
      }

      // Update the webview with current device list
      if (this.currentPanel) {
        console.log('📝 FlutterPanelController: Updating webview with device list...');
        this.currentPanel.webview.postMessage({
          command: 'updateDevices',
          devices: this.connectedDevices
        });
      }
      
      console.log('✅ FlutterPanelController: Device list refreshed successfully');
    } catch (error) {
      console.error('❌ FlutterPanelController: Failed to refresh devices:', error);
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.showErrorMessage(`Failed to refresh devices: ${errorMessage}`);
      
      // Fallback to empty device list
      this.connectedDevices = [];
      if (this.currentPanel) {
        this.currentPanel.webview.postMessage({
          command: 'updateDevices',
          devices: this.connectedDevices
        });
      }
    }
  }

  private async connectWirelessDevice() {
    console.log('📱 FlutterPanelController: connectWirelessDevice called')
    
    const ip = await vscode.window.showInputBox({
      prompt: 'Enter device IP address',
      placeHolder: '192.168.100.25'
    });

    if (!ip) {
      console.log('❌ FlutterPanelController: No IP address provided')
      return;
    }

    const port = await vscode.window.showInputBox({
      prompt: 'Enter port number',
      placeHolder: '5555',
      value: '5555'
    });

    if (!port) {
      console.log('❌ FlutterPanelController: No port provided')
      return;
    }

    console.log(`🔗 FlutterPanelController: Connecting to ${ip}:${port}`)
    await this.handleConnectDevice(ip, port);
  }

  private async showConnectedDevices() {
    console.log('🔍 FlutterPanelController: showConnectedDevices called')
    await this.refreshConnectedDevices();
    vscode.window.showInformationMessage(`Found ${this.connectedDevices.length} connected devices`);
  }

  private async runFlutterApp() {
    console.log('🚀 FlutterPanelController: runFlutterApp called')
    await this.handleFlutterCommand('runApp');
  }
  
  private async runFlutterAppDirect() {
    console.log('🚀 FlutterPanelController: runFlutterAppDirect called')
    const terminal = vscode.window.createTerminal('Flutter Run');
    terminal.show();
    terminal.sendText('flutter run');
  }

  // Removed unused methods: buildFlutterApp, hotReload, hotRestart, stopApp

  private async cleanProject() {
    console.log('🧹 FlutterPanelController: cleanProject called')
    await this.handleFlutterCommand('cleanProject');
  }
  
  private async cleanProjectDirect() {
    console.log('🧹 FlutterPanelController: cleanProjectDirect called')
    const terminal = vscode.window.createTerminal('Flutter Clean');
    terminal.show();
    terminal.sendText('flutter clean');
  }

  private async flutterDoctor() {
    console.log('👨‍⚕️ FlutterPanelController: flutterDoctor called')
    await this.handleFlutterCommand('runFlutterDoctor');
  }
  
  private async flutterDoctorDirect() {
    console.log('👨‍⚕️ FlutterPanelController: flutterDoctorDirect called')
    const terminal = vscode.window.createTerminal('Flutter Doctor');
    terminal.show();
    terminal.sendText('flutter doctor');
  }

  private async getPackages() {
    console.log('📦 FlutterPanelController: getPackages called')
    await this.handleFlutterCommand('getPackages');
  }
  
  private async getPackagesDirect() {
    console.log('📦 FlutterPanelController: getPackagesDirect called')
    const terminal = vscode.window.createTerminal('Flutter Packages');
    terminal.show();
    terminal.sendText('flutter pub get');
  }

  private async upgradePackages() {
    console.log('⬆️ FlutterPanelController: upgradePackages called')
    await this.handleFlutterCommand('upgradePackages');
  }
  
  private async upgradePackagesDirect() {
    console.log('⬆️ FlutterPanelController: upgradePackagesDirect called')
    const terminal = vscode.window.createTerminal('Flutter Upgrade Packages');
    terminal.show();
    terminal.sendText('flutter pub upgrade');
  }

  private async buildAPK() {
    console.log('📱 FlutterPanelController: buildAPK called')
    await this.handleFlutterCommand('buildAPK');
  }
  
  private async buildAPKDirect() {
    console.log('📱 FlutterPanelController: buildAPKDirect called')
    const terminal = vscode.window.createTerminal('Flutter Build APK');
    terminal.show();
    terminal.sendText('flutter build apk');
  }

  private async buildAAB() {
    console.log('📦 FlutterPanelController: buildAAB called')
    await this.handleFlutterCommand('buildAppBundle');
  }
  
  private async buildAABDirect() {
    console.log('📦 FlutterPanelController: buildAABDirect called')
    const terminal = vscode.window.createTerminal('Flutter Build AAB');
    terminal.show();
    terminal.sendText('flutter build appbundle');
  }

  // Removed unused methods: analyzeProject, formatCode, injectResources, buildIOS, buildWeb, upgradeFlutterSDK

  private showSuccessMessage(message: string) {
    console.log(`✅ FlutterPanelController: Success message: ${message}`)
    vscode.window.showInformationMessage(message);
  }

  private showErrorMessage(message: string) {
    console.error(`❌ FlutterPanelController: Error message: ${message}`)
    vscode.window.showErrorMessage(message);
  }

  private isFlutterProject(workspacePath: string): boolean {
    try {
      const pubspecPath = path.join(workspacePath, 'pubspec.yaml');
      return fs.existsSync(pubspecPath);
    } catch (error) {
      console.error('❌ FlutterPanelController: Error checking Flutter project:', error);
      return false;
    }
  }
}
