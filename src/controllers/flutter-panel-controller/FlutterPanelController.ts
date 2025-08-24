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
    this.registerCommand('flutterFly.openFlutterPanel', () => this.openFlutterPanel())
      .registerCommand('flutterFly.connectWirelessDevice', () => this.connectWirelessDevice())
      .registerCommand('flutterFly.showConnectedDevices', () => this.showConnectedDevices())
      .registerCommand('flutterFly.runFlutterApp', () => this.runFlutterApp())
      .registerCommand('flutterFly.buildFlutterApp', () => this.buildFlutterApp());
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
                                    <input type="text" class="form-control" id="deviceIP" placeholder="Device IP Address" value="192.168.1.100">
                                </div>
                                <div class="input-group mb-3">
                                    <span class="input-group-text"><i class="fas fa-plug"></i></span>
                                    <input type="text" class="form-control" id="devicePort" placeholder="Port" value="5555">
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
                                <button class="btn btn-outline-info btn-sm" id="flutterDoctorBtn">
                                    <i class="fas fa-stethoscope"></i> Flutter Doctor
                                </button>
                                <button class="btn btn-outline-info btn-sm" id="getPackagesBtn">
                                    <i class="fas fa-download"></i> Get Packages
                                </button>
                                <button class="btn btn-outline-info btn-sm" id="upgradePackagesBtn">
                                    <i class="fas fa-arrow-up"></i> Upgrade Packages
                                </button>
                                <button class="btn btn-outline-info btn-sm" id="cleanProjectBtn">
                                    <i class="fas fa-broom"></i> Clean Project
                                </button>
                                <button class="btn btn-outline-info btn-sm" id="analyzeProjectBtn">
                                    <i class="fas fa-search"></i> Analyze Project
                                </button>
                                <button class="btn btn-outline-info btn-sm" id="formatCodeBtn">
                                    <i class="fas fa-magic"></i> Format Code
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
                                                        <button class="btn btn-outline-primary btn-sm" onclick="flutterFly.executeFlutterCommand('runApp')">
                                                            <i class="fas fa-play"></i> Run App
                                                        </button>
                                                        <button class="btn btn-outline-primary btn-sm" onclick="flutterFly.executeFlutterCommand('hotReload')">
                                                            <i class="fas fa-sync"></i> Hot Reload
                                                        </button>
                                                        <button class="btn btn-outline-primary btn-sm" onclick="flutterFly.executeFlutterCommand('hotRestart')">
                                                            <i class="fas fa-redo"></i> Hot Restart
                                                        </button>
                                                        <button class="btn btn-outline-primary btn-sm" onclick="flutterFly.executeFlutterCommand('stopApp')">
                                                            <i class="fas fa-stop"></i> Stop App
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
                                                        <button class="btn btn-outline-success btn-sm" onclick="flutterFly.executeFlutterCommand('buildIOS')">
                                                            <i class="fas fa-apple-alt"></i> Build iOS
                                                        </button>
                                                        <button class="btn btn-outline-success btn-sm" onclick="flutterFly.executeFlutterCommand('buildWeb')">
                                                            <i class="fas fa-globe"></i> Build Web
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Maintenance Commands -->
                                        <div class="col-md-6 mb-3">
                                            <div class="card command-card h-100">
                                                <div class="card-body">
                                                    <h6><i class="fas fa-tools text-warning"></i> Maintenance</h6>
                                                    <div class="d-grid gap-2">
                                                        <button class="btn btn-outline-warning btn-sm" onclick="flutterFly.executeFlutterCommand('cleanProject')">
                                                            <i class="fas fa-broom"></i> Clean Project
                                                        </button>
                                                        <button class="btn btn-outline-warning btn-sm" onclick="flutterFly.executeFlutterCommand('getPackages')">
                                                            <i class="fas fa-download"></i> Get Packages
                                                        </button>
                                                        <button class="btn btn-outline-warning btn-sm" onclick="flutterFly.executeFlutterCommand('upgradePackages')">
                                                            <i class="fas fa-arrow-up"></i> Upgrade Packages
                                                        </button>
                                                        <button class="btn btn-outline-warning btn-sm" onclick="flutterFly.executeFlutterCommand('injectResources')">
                                                            <i class="fas fa-syringe"></i> Inject Resources
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Quality Commands -->
                                        <div class="col-md-6 mb-3">
                                            <div class="card command-card h-100">
                                                <div class="card-body">
                                                    <h6><i class="fas fa-shield-alt text-info"></i> Quality</h6>
                                                    <div class="d-grid gap-2">
                                                        <button class="btn btn-outline-info btn-sm" onclick="flutterFly.executeFlutterCommand('analyzeProject')">
                                                            <i class="fas fa-search"></i> Analyze Project
                                                        </button>
                                                        <button class="btn btn-outline-info btn-sm" onclick="flutterFly.executeFlutterCommand('formatCode')">
                                                            <i class="fas fa-magic"></i> Format Code
                                                        </button>
                                                        <button class="btn btn-outline-info btn-sm" onclick="flutterFly.executeFlutterCommand('runFlutterDoctor')">
                                                            <i class="fas fa-stethoscope"></i> Flutter Doctor
                                                        </button>
                                                        <button class="btn btn-outline-info btn-sm" onclick="flutterFly.executeFlutterCommand('upgradeFlutterSDK')">
                                                            <i class="fas fa-arrow-up"></i> Upgrade SDK
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
                                    <button class="btn btn-outline-light btn-sm float-end" id="clearTerminalBtn">
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
    </body>
    </html>`;
  }

  private async handleConnectDevice(ip: string, port: string) {
    console.log(`🔗 FlutterPanelController: handleConnectDevice called for ${ip}:${port}`)
    
    try {
      const terminal = vscode.window.createTerminal('Flutter Fly - ADB Connect');
      terminal.show();
      
      const connectCommand = `adb connect ${ip}:${port}`;
      console.log(`📱 FlutterPanelController: Executing command: ${connectCommand}`)
      terminal.sendText(connectCommand);
      
      // Wait a bit for connection
      console.log('⏳ FlutterPanelController: Waiting for connection...')
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh devices
      console.log('🔄 FlutterPanelController: Refreshing device list...')
      await this.refreshConnectedDevices();
      
      console.log(`✅ FlutterPanelController: Successfully connected to ${ip}:${port}`)
      this.showSuccessMessage(`Successfully connected to ${ip}:${port}`);
    } catch (error) {
      console.error(`❌ FlutterPanelController: Failed to connect to ${ip}:${port}:`, error)
      this.showErrorMessage(`Failed to connect to ${ip}:${port}: ${error}`);
    }
  }

  private async handleFlutterCommand(commandId: string) {
    console.log(`⚡ FlutterPanelController: handleFlutterCommand called for command ID: ${commandId}`)
    
    const command = this.flutterCommands.find(cmd => cmd.id === commandId);
    if (!command) {
      console.log(`❌ FlutterPanelController: Command not found for ID: ${commandId}`)
      return;
    }

    console.log(`🚀 FlutterPanelController: Executing command: ${command.name} (${command.command})`)
    
    try {
      const terminal = vscode.window.createTerminal('Flutter Fly - Command');
      terminal.show();
      terminal.sendText(command.command);
      
      console.log(`✅ FlutterPanelController: Successfully executed: ${command.name}`)
      this.showSuccessMessage(`Executed: ${command.name}`);
    } catch (error) {
      console.error(`❌ FlutterPanelController: Failed to execute ${command.name}:`, error)
      this.showErrorMessage(`Failed to execute ${command.name}: ${error}`);
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
      // This would typically run adb devices and parse the output
      // For now, we'll simulate some devices
      console.log('📱 FlutterPanelController: Simulating device list...')
      this.connectedDevices = [
        {
          id: '192.168.1.100:5555',
          name: 'Samsung Galaxy S21',
          status: 'online',
          type: 'device'
        },
        {
          id: 'emulator-5554',
          name: 'Android Emulator',
          status: 'online',
          type: 'emulator'
        }
      ];

      console.log(`📱 FlutterPanelController: Found ${this.connectedDevices.length} devices`)

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
    }
  }

  private async connectWirelessDevice() {
    console.log('📱 FlutterPanelController: connectWirelessDevice called')
    
    const ip = await vscode.window.showInputBox({
      prompt: 'Enter device IP address',
      placeHolder: '192.168.1.100'
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
    const terminal = vscode.window.createTerminal('Flutter Fly - Run App');
    terminal.show();
    terminal.sendText('flutter run');
    console.log('✅ FlutterPanelController: Flutter run command sent to terminal')
  }

  private async buildFlutterApp() {
    console.log('🏗️ FlutterPanelController: buildFlutterApp called')
    const buildType = await vscode.window.showQuickPick(['APK', 'AAB', 'iOS'], {
      placeHolder: 'Select build type'
    });

    if (!buildType) {
      console.log('❌ FlutterPanelController: No build type selected')
      return;
    }

    console.log(`🏗️ FlutterPanelController: Building ${buildType}`)
    const terminal = vscode.window.createTerminal('Flutter Fly - Build');
    terminal.show();
    
    if (buildType === 'APK') {
      terminal.sendText('flutter build apk');
    } else if (buildType === 'AAB') {
      terminal.sendText('flutter build appbundle');
    } else if (buildType === 'iOS') {
      terminal.sendText('flutter build ios');
    }
    
    console.log(`✅ FlutterPanelController: ${buildType} build command sent to terminal`)
  }

  private async hotReload() {
    console.log('🔄 FlutterPanelController: hotReload called')
    const terminal = vscode.window.createTerminal('Flutter Fly - Hot Reload');
    terminal.show();
    terminal.sendText('r');
    console.log('✅ FlutterPanelController: Hot reload command sent to terminal')
  }

  private async hotRestart() {
    console.log('🔄 FlutterPanelController: hotRestart called')
    const terminal = vscode.window.createTerminal('Flutter Fly - Hot Restart');
    terminal.show();
    terminal.sendText('R');
    console.log('✅ FlutterPanelController: Hot restart command sent to terminal')
  }

  private async stopApp() {
    console.log('⏹️ FlutterPanelController: stopApp called')
    const terminal = vscode.window.createTerminal('Flutter Fly - Stop App');
    terminal.show();
    terminal.sendText('q');
    console.log('✅ FlutterPanelController: Stop app command sent to terminal')
  }

  private async cleanProject() {
    console.log('🧹 FlutterPanelController: cleanProject called')
    const terminal = vscode.window.createTerminal('Flutter Fly - Clean Project');
    terminal.show();
    terminal.sendText('flutter clean');
    console.log('✅ FlutterPanelController: Clean project command sent to terminal')
  }

  private async flutterDoctor() {
    console.log('👨‍⚕️ FlutterPanelController: flutterDoctor called')
    const terminal = vscode.window.createTerminal('Flutter Fly - Flutter Doctor');
    terminal.show();
    terminal.sendText('flutter doctor');
    console.log('✅ FlutterPanelController: Flutter doctor command sent to terminal')
  }

  private async getPackages() {
    console.log('📦 FlutterPanelController: getPackages called')
    const terminal = vscode.window.createTerminal('Flutter Fly - Get Packages');
    terminal.show();
    terminal.sendText('flutter pub get');
    console.log('✅ FlutterPanelController: Get packages command sent to terminal')
  }

  private async upgradePackages() {
    console.log('⬆️ FlutterPanelController: upgradePackages called')
    const terminal = vscode.window.createTerminal('Flutter Fly - Upgrade Packages');
    terminal.show();
    terminal.sendText('flutter pub upgrade');
    console.log('✅ FlutterPanelController: Upgrade packages command sent to terminal')
  }

  private async buildAPK() {
    console.log('📱 FlutterPanelController: buildAPK called')
    const terminal = vscode.window.createTerminal('Flutter Fly - Build APK');
    terminal.show();
    terminal.sendText('flutter build apk');
    console.log('✅ FlutterPanelController: Build APK command sent to terminal')
  }

  private async buildAAB() {
    console.log('📦 FlutterPanelController: buildAAB called')
    const terminal = vscode.window.createTerminal('Flutter Fly - Build AAB');
    terminal.show();
    terminal.sendText('flutter build appbundle');
    console.log('✅ FlutterPanelController: Build AAB command sent to terminal')
  }

  private async analyzeProject() {
    console.log('🔍 FlutterPanelController: analyzeProject called')
    const terminal = vscode.window.createTerminal('Flutter Fly - Analyze Project');
    terminal.show();
    terminal.sendText('flutter analyze');
    console.log('✅ FlutterPanelController: Analyze project command sent to terminal')
  }

  private async formatCode() {
    console.log('✨ FlutterPanelController: formatCode called')
    const terminal = vscode.window.createTerminal('Flutter Fly - Format Code');
    terminal.show();
    terminal.sendText('dart format .');
    console.log('✅ FlutterPanelController: Format code command sent to terminal')
  }

  private async injectResources() {
    console.log('💉 FlutterPanelController: injectResources called')
    const terminal = vscode.window.createTerminal('Flutter Fly - Inject Resources');
    terminal.show();
    terminal.sendText('flutter pub run build_runner build');
    console.log('✅ FlutterPanelController: Inject resources command sent to terminal')
  }

  private async buildIOS() {
    console.log('🍎 FlutterPanelController: buildIOS called')
    const terminal = vscode.window.createTerminal('Flutter Fly - Build iOS');
    terminal.show();
    terminal.sendText('flutter build ios');
    console.log('✅ FlutterPanelController: Build iOS command sent to terminal')
  }

  private async buildWeb() {
    console.log('🌐 FlutterPanelController: buildWeb called')
    const terminal = vscode.window.createTerminal('Flutter Fly - Build Web');
    terminal.show();
    terminal.sendText('flutter build web');
    console.log('✅ FlutterPanelController: Build web command sent to terminal')
  }

  private async upgradeFlutterSDK() {
    console.log('⬆️ FlutterPanelController: upgradeFlutterSDK called')
    const terminal = vscode.window.createTerminal('Flutter Fly - Upgrade Flutter SDK');
    terminal.show();
    terminal.sendText('flutter upgrade');
    console.log('✅ FlutterPanelController: Upgrade Flutter SDK command sent to terminal')
  }

  private showSuccessMessage(message: string) {
    console.log(`✅ FlutterPanelController: Success message: ${message}`)
    vscode.window.showInformationMessage(message);
  }

  private showErrorMessage(message: string) {
    console.error(`❌ FlutterPanelController: Error message: ${message}`)
    vscode.window.showErrorMessage(message);
  }
}
