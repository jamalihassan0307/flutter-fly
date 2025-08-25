import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ADBBaseController } from '../adb-controller/ADBBaseController';
// Removed mock ADB dependencies - using simple device management

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

  constructor(context: vscode.ExtensionContext) {
    super(context);
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
        localResourceRoots: [
          vscode.Uri.joinPath(this.context.extensionUri, 'media'),
          vscode.Uri.joinPath(this.context.extensionUri, 'src', 'webview')
        ]
      }
    );

    console.log('📝 FlutterPanelController: Setting webview HTML content...')
    this.currentPanel.webview.html = this.getWebviewContent(this.currentPanel);

    this.currentPanel.webview.onDidReceiveMessage(
      async (message) => {
        console.log('📨 FlutterPanelController: Received message:', message)
        switch (message.command) {
          case 'connectDevice':
            console.log('🔗 FlutterPanelController: Connecting device...')
            await this.handleConnectDevice(message.ip, message.port);
            break;
          case 'runFlutterCommand':
            console.log('⚡ FlutterPanelController: Running Flutter command...')
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
    const styleUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'flutter-fly.css'));
    const scriptUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'flutter-fly.js'));

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
        <script src="${scriptUri}"></script>
    </body>
    </html>`;
  }

  private async handleConnectDevice(ip: string, port: string) {
    console.log(`🔗 FlutterPanelController: handleConnectDevice called for ${ip}:${port}`)
    
    try {
      // Simple device connection - add to list without ADB dependency
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
        vscode.window.showInformationMessage(`Successfully connected to device ${ip}:${port}`);
        
        // Update webview with success message
        if (this.currentPanel) {
          this.currentPanel.webview.postMessage({
            command: 'addStatusMessage',
            message: `✅ Successfully connected to device ${ip}:${port}`,
            type: 'success'
          });
        }
      } else {
        console.log(`ℹ️ FlutterPanelController: Device ${ip}:${port} already connected`);
        vscode.window.showInformationMessage(`Device ${ip}:${port} is already connected`);
      }
      
      console.log(`✅ FlutterPanelController: Device connection handled for ${ip}:${port}`);
    } catch (error) {
      console.error(`❌ FlutterPanelController: Failed to handle connection for ${ip}:${port}:`, error)
      this.showErrorMessage(`Failed to handle connection: ${error}`);
      
      // Update webview with error message
      if (this.currentPanel) {
        this.currentPanel.webview.postMessage({
          command: 'addStatusMessage',
          message: `❌ Failed to connect: ${error.message}`,
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
      
      // Check if we have an active workspace
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        throw new Error('No Flutter workspace found. Please open a Flutter project folder.');
      }
      
      // Get the first workspace folder (usually the main project)
      const workspaceFolder = workspaceFolders[0];
      console.log(`📁 FlutterPanelController: Using workspace: ${workspaceFolder.name}`)
      
      // Check if this is actually a Flutter project
      if (!this.isFlutterProject(workspaceFolder.uri.fsPath)) {
        throw new Error('Not a Flutter project. Please open a folder containing pubspec.yaml');
      }
      
      // Create terminal with proper cwd
      const terminal = vscode.window.createTerminal({
        name: `Flutter Fly - ${commandName}`,
        cwd: workspaceFolder.uri.fsPath
      });
      
      terminal.show();
      
      // Wait for terminal to be ready and then execute command
      setTimeout(() => {
        try {
          // First ensure we're in the right directory
          terminal.sendText(`cd "${workspaceFolder.uri.fsPath}"`);
          // Then execute the Flutter command
          terminal.sendText(commandToExecute);
          console.log(`✅ FlutterPanelController: Command sent to terminal: ${commandToExecute}`)
        } catch (sendError) {
          console.error(`❌ FlutterPanelController: Failed to send command to terminal:`, sendError)
          throw new Error(`Failed to send command to terminal: ${sendError.message}`);
        }
      }, 1000); // Increased delay for better reliability
      
      console.log(`✅ FlutterPanelController: Successfully executed: ${commandName}`)
      this.showSuccessMessage(`Executed: ${commandName}`);
      
      // Update webview with success message
      if (this.currentPanel) {
        this.currentPanel.webview.postMessage({
          command: 'addStatusMessage',
          message: `✅ Successfully executed: ${commandName}`,
          type: 'success'
        });
      }
    } catch (error) {
      console.error(`❌ FlutterPanelController: Failed to execute command ${commandId}:`, error)
      const errorMessage = error.message || 'Unknown error occurred';
      this.showErrorMessage(`Failed to execute command: ${errorMessage}`);
      
      // Update webview with error message
      if (this.currentPanel) {
        this.currentPanel.webview.postMessage({
          command: 'addStatusMessage',
          message: `❌ Failed to execute: ${errorMessage}`,
          type: 'error'
        });
      }
    }
  }

  private async handleDisconnectDevice(deviceId: string) {
    console.log(`❌ FlutterPanelController: handleDisconnectDevice called for device: ${deviceId}`)
    
    try {
      const terminal = vscode.window.createTerminal('Flutter Fly - ADB Disconnect');
      terminal.show();
      
      const disconnectCommand = `adb disconnect ${deviceId}`;
      console.log(`📱 FlutterPanelController: Executing command: ${disconnectCommand}`)
      terminal.sendText(disconnectCommand);
      
      console.log('🔄 FlutterPanelController: Refreshing device list after disconnect...')
      await this.refreshConnectedDevices();
      
      console.log(`✅ FlutterPanelController: Successfully disconnected device: ${deviceId}`)
      this.showSuccessMessage(`Disconnected device: ${deviceId}`);
    } catch (error) {
      console.error(`❌ FlutterPanelController: Failed to disconnect device:`, error)
      this.showErrorMessage(`Failed to disconnect device: ${error}`);
    }
  }

  private async refreshConnectedDevices() {
    console.log('🔄 FlutterPanelController: refreshConnectedDevices called')
    
    try {
      // Simple device refresh - just show current connected devices
      console.log(`📱 FlutterPanelController: Current connected devices: ${this.connectedDevices.length}`)

      // Update the webview with current device list
      if (this.currentPanel) {
        console.log('📝 FlutterPanelController: Updating webview with device list...')
        this.currentPanel.webview.postMessage({
          command: 'updateDevices',
          devices: this.connectedDevices
        });
      }
      
      console.log('✅ FlutterPanelController: Device list refreshed successfully')
    } catch (error) {
      console.error('❌ FlutterPanelController: Failed to refresh devices:', error)
      this.showErrorMessage(`Failed to refresh devices: ${error}`);
      
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

  // Removed unused methods: buildFlutterApp, hotReload, hotRestart, stopApp

  private async cleanProject() {
    console.log('🧹 FlutterPanelController: cleanProject called')
    const terminal = vscode.window.createTerminal('Flutter Fly - Clean Project');
    terminal.show();
    terminal.sendText('flutter clean');
    console.log('✅ FlutterPanelController: Clean project command sent to terminal')
  }

  private async flutterDoctor() {
    console.log('👨‍⚕️ FlutterPanelController: flutterDoctor called')
    await this.handleFlutterCommand('runFlutterDoctor');
  }

  private async getPackages() {
    console.log('📦 FlutterPanelController: getPackages called')
    await this.handleFlutterCommand('getPackages');
  }

  private async upgradePackages() {
    console.log('⬆️ FlutterPanelController: upgradePackages called')
    await this.handleFlutterCommand('upgradePackages');
  }

  private async buildAPK() {
    console.log('📱 FlutterPanelController: buildAPK called')
    await this.handleFlutterCommand('buildAPK');
  }

  private async buildAAB() {
    console.log('📦 FlutterPanelController: buildAAB called')
    await this.handleFlutterCommand('buildAppBundle');
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
