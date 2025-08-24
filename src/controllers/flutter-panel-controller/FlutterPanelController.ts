import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ADBBaseController } from '../adb-controller/ADBBaseController';

interface Device {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'unauthorized';
  type: 'device' | 'emulator';
}

interface FlutterCommand {
  id: string;
  name: string;
  description: string;
  command: string;
  category: string;
}

export class FlutterPanelController extends ADBBaseController {
  private currentPanel: vscode.WebviewPanel | undefined;
  private connectedDevices: Device[] = [];
  private flutterCommands: FlutterCommand[] = [
    {
      id: 'flutterDoctor',
      name: 'Flutter Doctor',
      description: 'Check Flutter installation and dependencies',
      command: 'flutter doctor',
      category: 'Health Check'
    },
    {
      id: 'getPackages',
      name: 'Get Packages',
      description: 'Download and update Flutter packages',
      command: 'flutter pub get',
      category: 'Dependencies'
    },
    {
      id: 'runApp',
      name: 'Run App',
      description: 'Run Flutter app on connected device',
      command: 'flutter run',
      category: 'Development'
    },
    {
      id: 'buildAPK',
      name: 'Build APK',
      description: 'Build Android APK file',
      command: 'flutter build apk',
      category: 'Building'
    },
    {
      id: 'buildAAB',
      name: 'Build AAB',
      description: 'Build Android App Bundle',
      command: 'flutter build appbundle',
      category: 'Building'
    },
    {
      id: 'hotReload',
      name: 'Hot Reload',
      description: 'Hot reload the running app',
      command: 'r',
      category: 'Development'
    },
    {
      id: 'hotRestart',
      name: 'Hot Restart',
      description: 'Hot restart the running app',
      command: 'R',
      category: 'Development'
    },
    {
      id: 'stopApp',
      name: 'Stop App',
      description: 'Stop the running Flutter app',
      command: 'q',
      category: 'Development'
    },
    {
      id: 'cleanProject',
      name: 'Clean Project',
      description: 'Clean Flutter project build files',
      command: 'flutter clean',
      category: 'Maintenance'
    },
    {
      id: 'analyzeProject',
      name: 'Analyze Project',
      description: 'Analyze Flutter project for issues',
      command: 'flutter analyze',
      category: 'Quality'
    }
  ];

  constructor(context: vscode.ExtensionContext) {
    super(context);
  }

  async onInit() {
    // Only register panel-specific commands, not Flutter commands
    this.registerCommand('flutterFly.openFlutterPanel', () => this.openFlutterPanel())
      .registerCommand('flutterFly.connectWirelessDevice', () => this.connectWirelessDevice())
      .registerCommand('flutterFly.showConnectedDevices', () => this.showConnectedDevices());
    
    // Check ADB availability
    const adbAvailable = await this.checkADBAvailability();
    if (!adbAvailable) {
      console.log('⚠️ FlutterPanelController: ADB not available, will show help when panel opens');
    }
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
          vscode.Uri.joinPath(this.context.extensionUri, 'media')
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
                                    <input type="text" class="form-control" id="deviceIP" placeholder="Device IP Address" value="192.168.1.100">
                                </div>
                                <div class="input-group mb-3">
                                    <span class="input-group-text"><i class="fas fa-plug"></i></span>
                                    <input type="text" class="form-control" id="devicePort" placeholder="Port" value="5555">
                                </div>
                                <button class="btn btn-success w-100" id="connectBtn" onclick="connectDevice()">
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
                                <button class="btn btn-outline-primary btn-sm w-100" id="refreshDevicesBtn" onclick="refreshDevices()">
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
                                <button class="btn btn-outline-info btn-sm" onclick="runFlutterCommand('flutterDoctor')">
                                    <i class="fas fa-stethoscope"></i> Flutter Doctor
                                </button>
                                <button class="btn btn-outline-info btn-sm" onclick="runFlutterCommand('getPackages')">
                                    <i class="fas fa-download"></i> Get Packages
                                </button>
                                <button class="btn btn-outline-info btn-sm" onclick="runFlutterCommand('cleanProject')">
                                    <i class="fas fa-broom"></i> Clean Project
                                </button>
                                <button class="btn btn-outline-info btn-sm" onclick="runFlutterCommand('buildAPK')">
                                    <i class="fas fa-mobile-alt"></i> Build APK
                                </button>
                                <button class="btn btn-outline-info btn-sm" onclick="runFlutterCommand('buildAAB')">
                                    <i class="fas fa-box"></i> Build AAB
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
                                        <!-- Development Commands -->
                                        <div class="col-md-6 mb-3">
                                            <div class="card command-card h-100">
                                                <div class="card-body">
                                                    <h6><i class="fas fa-rocket text-primary"></i> Development</h6>
                                                    <div class="d-grid gap-2">
                                                        <button class="btn btn-outline-primary btn-sm" onclick="runFlutterCommand('runApp')">
                                                            <i class="fas fa-play"></i> Run App
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
                                                        <button class="btn btn-outline-success btn-sm" onclick="runFlutterCommand('buildAPK')">
                                                            <i class="fas fa-mobile-alt"></i> Build APK
                                                        </button>
                                                        <button class="btn btn-outline-success btn-sm" onclick="runFlutterCommand('buildAAB')">
                                                            <i class="fas fa-box"></i> Build AAB
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

                    <!-- Terminal Output -->
                    <div class="row mt-3">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header bg-dark text-white">
                                    <h6><i class="fas fa-terminal"></i> Terminal Output</h6>
                                    <button class="btn btn-outline-light btn-sm float-end" id="clearTerminalBtn" onclick="clearTerminal()">
                                        <i class="fas fa-trash"></i> Clear
                                    </button>
                                </div>
                                <div class="card-body">
                                    <div id="terminalOutput" class="terminal-output">
                                        <div class="text-muted text-center py-3">
                                            <i class="fas fa-terminal fa-2x mb-2"></i>
                                            <p>Terminal output will appear here</p>
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
        <script>
            // Webview message handling
            const vscode = acquireVsCodeApi();
            
            function connectDevice() {
                const ip = document.getElementById('deviceIP').value;
                const port = document.getElementById('devicePort').value;
                vscode.postMessage({
                    command: 'connectDevice',
                    ip: ip,
                    port: port
                });
                addTerminalOutput('Connecting to ' + ip + ':' + port + '...');
            }
            
            function refreshDevices() {
                vscode.postMessage({
                    command: 'refreshDevices'
                });
                addTerminalOutput('Refreshing device list...');
            }
            
            function runFlutterCommand(commandId) {
                vscode.postMessage({
                    command: 'runFlutterCommand',
                    commandId: commandId
                });
                addTerminalOutput('Executing Flutter command: ' + commandId);
            }
            
            function addTerminalOutput(message) {
                const terminal = document.getElementById('terminalOutput');
                const timestamp = new Date().toLocaleTimeString();
                terminal.innerHTML += '<div class="terminal-line"><span class="timestamp">[' + timestamp + ']</span> ' + message + '</div>';
                terminal.scrollTop = terminal.scrollHeight;
            }
            
            function clearTerminal() {
                document.getElementById('terminalOutput').innerHTML = '<div class="text-muted text-center py-3"><i class="fas fa-terminal fa-2x mb-2"></i><p>Terminal cleared</p></div>';
            }
            
            // Listen for messages from extension
            window.addEventListener('message', event => {
                const message = event.data;
                switch (message.command) {
                    case 'updateDevices':
                        updateDevicesList(message.devices);
                        break;
                }
            });
            
            function updateDevicesList(devices) {
                const devicesList = document.getElementById('devicesList');
                if (devices && devices.length > 0) {
                    let html = '';
                    devices.forEach(device => {
                        const statusClass = device.status === 'online' ? 'text-success' : 'text-danger';
                        html += '<div class="device-item mb-2 p-2 border rounded">';
                        html += '<div class="d-flex justify-content-between align-items-center">';
                        html += '<div><strong>' + device.name + '</strong><br><small class="text-muted">' + device.id + '</small></div>';
                        html += '<span class="badge ' + statusClass + '">' + device.status + '</span>';
                        html += '</div></div>';
                    });
                    devicesList.innerHTML = html;
                } else {
                    devicesList.innerHTML = '<div class="text-muted text-center py-3"><i class="fas fa-mobile-alt fa-2x mb-2"></i><p>No devices connected</p></div>';
                }
            }
        </script>
    </body>
    </html>`;
  }

  private async handleConnectDevice(ip: string, port: string) {
    console.log(`🔗 FlutterPanelController: handleConnectDevice called for ${ip}:${port}`)
    
    try {
      // First check if ADB is available
      const adbResolver = new (await import('../../domain/adb-resolver')).ADBResolver(
        require('os').homedir(),
        require('os').type(),
        new (await import('../../domain/console/console-interface')).ConsoleInterface(),
        this.context.globalState
      );
      
      try {
        // Try to connect using ADB
        console.log(`📱 FlutterPanelController: Attempting ADB connection to ${ip}:${port}`)
        const result = await adbResolver.sendADBCommand(`adb connect ${ip}:${port}`);
        const output = result.toString();
        
        if (output.includes('connected to') || output.includes('already connected to')) {
          console.log(`✅ FlutterPanelController: Successfully connected to ${ip}:${port}`)
          this.showSuccessMessage(`Successfully connected to ${ip}:${port}`);
          
          // Wait a bit for connection to stabilize
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Refresh devices
          await this.refreshConnectedDevices();
        } else {
          console.log(`❌ FlutterPanelController: Failed to connect to ${ip}:${port}`)
          this.showErrorMessage(`Failed to connect to ${ip}:${port}. Output: ${output}`);
        }
      } catch (adbError) {
        console.log(`❌ FlutterPanelController: ADB connection failed: ${adbError}`)
        // Fallback: show instructions to user
        this.showErrorMessage(`ADB connection failed. Please ensure ADB is installed and in your PATH. Error: ${adbError}`);
        
        // Show helpful message
        vscode.window.showInformationMessage(
          'ADB not found. Please install Android SDK Platform Tools and add to PATH.',
          'Open Documentation'
        ).then(selection => {
          if (selection === 'Open Documentation') {
            vscode.env.openExternal(vscode.Uri.parse('https://developer.android.com/studio/command-line/adb'));
          }
        });
      }
    } catch (error) {
      console.error(`❌ FlutterPanelController: Failed to connect to ${ip}:${port}:`, error)
      this.showErrorMessage(`Failed to connect to ${ip}:${port}: ${error}`);
    }
  }

  private async handleFlutterCommand(commandId: string) {
    console.log(`⚡ FlutterPanelController: handleFlutterCommand called for command ID: ${commandId}`)
    
    try {
      let command: string;
      let description: string;
      
      switch (commandId) {
        case 'flutterDoctor':
          command = 'flutter doctor';
          description = 'Flutter Doctor';
          break;
        case 'getPackages':
          command = 'flutter pub get';
          description = 'Get Packages';
          break;
        case 'cleanProject':
          command = 'flutter clean';
          description = 'Clean Project';
          break;
        case 'buildAPK':
          command = 'flutter build apk --debug';
          description = 'Build APK';
          break;
        case 'buildAAB':
          command = 'flutter build appbundle --debug';
          description = 'Build AAB';
          break;
        case 'runApp':
          command = 'flutter run';
          description = 'Run App';
          break;
        case 'hotReload':
          command = 'r';
          description = 'Hot Reload';
          break;
        case 'hotRestart':
          command = 'R';
          description = 'Hot Restart';
          break;
        case 'stopApp':
          command = 'q';
          description = 'Stop App';
          break;
        default:
          console.log(`❌ FlutterPanelController: Unknown command ID: ${commandId}`)
          return;
      }

      console.log(`🚀 FlutterPanelController: Executing command: ${description} (${command})`)
      
      const terminal = vscode.window.createTerminal('Flutter Fly - Command');
      terminal.show();
      terminal.sendText(command);
      
      console.log(`✅ FlutterPanelController: Successfully executed: ${description}`)
      this.showSuccessMessage(`Executed: ${description}`);
    } catch (error) {
      console.error(`❌ FlutterPanelController: Failed to execute command:`, error)
      this.showErrorMessage(`Failed to execute command: ${error}`);
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
      // Get real connected devices using ADB
      console.log('📱 FlutterPanelController: Getting real device list...')
      
      // Use the ADB resolver to get actual devices
      const adbResolver = new (await import('../../domain/adb-resolver')).ADBResolver(
        require('os').homedir(),
        require('os').type(),
        new (await import('../../domain/console/console-interface')).ConsoleInterface(),
        this.context.globalState
      );
      
      try {
        // Try to get devices using ADB
        const devicesOutput = await adbResolver.sendADBCommand('adb devices');
        const output = devicesOutput.toString();
        
        if (output.includes('List of devices attached')) {
          // Parse the output to get real devices
          const lines = output.split('\n').filter(line => line.trim() && !line.includes('List of devices attached'));
          this.connectedDevices = lines.map(line => {
            const parts = line.trim().split('\t');
            if (parts.length >= 2) {
              let status: 'online' | 'offline' | 'unauthorized' = 'offline';
              if (parts[1] === 'device') status = 'online';
              else if (parts[1] === 'unauthorized') status = 'unauthorized';
              
              return {
                id: parts[0],
                name: parts[0].includes('emulator') ? 'Android Emulator' : 'Android Device',
                status: status,
                type: parts[0].includes('emulator') ? 'emulator' as const : 'device' as const
              };
            }
            return null;
          }).filter(device => device !== null);
        } else {
          this.connectedDevices = [];
        }
      } catch (adbError) {
        console.log('📱 FlutterPanelController: ADB not available, showing empty device list')
        this.connectedDevices = [];
      }

      console.log(`📱 FlutterPanelController: Found ${this.connectedDevices.length} real devices`)

      // Update the webview with new device list
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
      this.connectedDevices = [];
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

  private async checkADBAvailability(): Promise<boolean> {
    try {
      const adbResolver = new (await import('../../domain/adb-resolver')).ADBResolver(
        require('os').homedir(),
        require('os').type(),
        new (await import('../../domain/console/console-interface')).ConsoleInterface(),
        this.context.globalState
      );
      
      await adbResolver.getDefaultADBPath();
      return true;
    } catch (error) {
      console.log('❌ FlutterPanelController: ADB not available:', error);
      return false;
    }
  }

  private async showADBHelp() {
    const message = `ADB (Android Debug Bridge) is not available on your system.

To fix this:

1. **Install Android Studio** (recommended):
   - Download from: https://developer.android.com/studio
   - Install and ensure "Android SDK Platform Tools" is selected

2. **Or install Platform Tools only**:
   - Download from: https://developer.android.com/studio/releases/platform-tools
   - Extract to a folder (e.g., C:\\Android\\platform-tools)

3. **Add to PATH**:
   - Add the platform-tools folder to your system PATH
   - Restart VS Code after adding to PATH

4. **Verify installation**:
   - Open Command Prompt and type: adb version
   - Should show ADB version information

Current PATH: ${process.env.PATH}`;

    vscode.window.showInformationMessage(
      'ADB not found. Would you like help installing it?',
      'Show Help',
      'Open Documentation'
    ).then(selection => {
      if (selection === 'Show Help') {
        vscode.window.showInformationMessage(message);
      } else if (selection === 'Open Documentation') {
        vscode.env.openExternal(vscode.Uri.parse('https://developer.android.com/studio/command-line/adb'));
      }
    });
  }

  // Panel-specific methods only - Flutter commands are handled by FlutterCommandsController

  private showSuccessMessage(message: string) {
    console.log(`✅ FlutterPanelController: Success message: ${message}`)
    vscode.window.showInformationMessage(message);
  }

  private showErrorMessage(message: string) {
    console.error(`❌ FlutterPanelController: Error message: ${message}`)
    vscode.window.showErrorMessage(message);
  }
}
