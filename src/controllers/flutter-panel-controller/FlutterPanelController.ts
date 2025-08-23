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
      .registerCommand('flutterFly.buildFlutterApp', () => this.buildFlutterApp())
      .registerCommand('flutterFly.flutterDoctor', () => this.flutterDoctor())
      .registerCommand('flutterFly.getPackages', () => this.getPackages())
      .registerCommand('flutterFly.hotReload', () => this.hotReload())
      .registerCommand('flutterFly.hotRestart', () => this.hotRestart())
      .registerCommand('flutterFly.stopApp', () => this.stopApp())
      .registerCommand('flutterFly.cleanProject', () => this.cleanProject());
  }

  private async openFlutterPanel() {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (this.currentPanel) {
      this.currentPanel.reveal(column);
      return;
    }

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

    this.currentPanel.webview.html = this.getWebviewContent(this.currentPanel);

    this.currentPanel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'connectDevice':
            await this.handleConnectDevice(message.ip, message.port);
            break;
          case 'runFlutterCommand':
            await this.handleFlutterCommand(message.commandId);
            break;
          case 'refreshDevices':
            await this.refreshConnectedDevices();
            break;
          case 'disconnectDevice':
            await this.handleDisconnectDevice(message.deviceId);
            break;
        }
      }
    );

    this.currentPanel.onDidDispose(() => {
      this.currentPanel = undefined;
    });

    // Initial device refresh
    await this.refreshConnectedDevices();
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
                                <button class="btn btn-outline-info btn-sm" id="cleanProjectBtn">
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
                                        <!-- Flutter commands will be populated here -->
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
    try {
      const terminal = vscode.window.createTerminal('Flutter Fly - ADB Connect');
      terminal.show();
      
      const connectCommand = `adb connect ${ip}:${port}`;
      terminal.sendText(connectCommand);
      
      // Wait a bit for connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh devices
      await this.refreshConnectedDevices();
      
      this.showSuccessMessage(`Successfully connected to ${ip}:${port}`);
    } catch (error) {
      this.showErrorMessage(`Failed to connect to ${ip}:${port}: ${error}`);
    }
  }

  private async handleFlutterCommand(commandId: string) {
    const command = this.flutterCommands.find(cmd => cmd.id === commandId);
    if (!command) return;

    try {
      const terminal = vscode.window.createTerminal('Flutter Fly - Command');
      terminal.show();
      terminal.sendText(command.command);
      
      this.showSuccessMessage(`Executed: ${command.name}`);
    } catch (error) {
      this.showErrorMessage(`Failed to execute ${command.name}: ${error}`);
    }
  }

  private async handleDisconnectDevice(deviceId: string) {
    try {
      const terminal = vscode.window.createTerminal('Flutter Fly - ADB Disconnect');
      terminal.show();
      terminal.sendText(`adb disconnect ${deviceId}`);
      
      await this.refreshConnectedDevices();
      this.showSuccessMessage(`Disconnected device: ${deviceId}`);
    } catch (error) {
      this.showErrorMessage(`Failed to disconnect device: ${error}`);
    }
  }

  private async refreshConnectedDevices() {
    try {
      // This would typically run adb devices and parse the output
      // For now, we'll simulate some devices
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

      // Update the webview with new device list
      if (this.currentPanel) {
        this.currentPanel.webview.postMessage({
          command: 'updateDevices',
          devices: this.connectedDevices
        });
      }
    } catch (error) {
      this.showErrorMessage(`Failed to refresh devices: ${error}`);
    }
  }

  private async connectWirelessDevice() {
    const ip = await vscode.window.showInputBox({
      prompt: 'Enter device IP address',
      placeHolder: '192.168.1.100'
    });

    if (!ip) return;

    const port = await vscode.window.showInputBox({
      prompt: 'Enter port number',
      placeHolder: '5555',
      value: '5555'
    });

    if (!port) return;

    await this.handleConnectDevice(ip, port);
  }

  private async showConnectedDevices() {
    await this.refreshConnectedDevices();
    vscode.window.showInformationMessage(`Found ${this.connectedDevices.length} connected devices`);
  }

  private async runFlutterApp() {
    const terminal = vscode.window.createTerminal('Flutter Fly - Run App');
    terminal.show();
    terminal.sendText('flutter run');
  }

  private async buildFlutterApp() {
    const buildType = await vscode.window.showQuickPick(['APK', 'AAB', 'iOS'], {
      placeHolder: 'Select build type'
    });

    if (!buildType) return;

    const terminal = vscode.window.createTerminal('Flutter Fly - Build');
    terminal.show();
    
    if (buildType === 'APK') {
      terminal.sendText('flutter build apk');
    } else if (buildType === 'AAB') {
      terminal.sendText('flutter build appbundle');
    } else if (buildType === 'iOS') {
      terminal.sendText('flutter build ios');
    }
  }

  private async flutterDoctor() {
    const terminal = vscode.window.createTerminal('Flutter Fly - Doctor');
    terminal.show();
    terminal.sendText('flutter doctor');
  }

  private async getPackages() {
    const terminal = vscode.window.createTerminal('Flutter Fly - Get Packages');
    terminal.show();
    terminal.sendText('flutter pub get');
  }

  private async hotReload() {
    const terminal = vscode.window.createTerminal('Flutter Fly - Hot Reload');
    terminal.show();
    terminal.sendText('r');
  }

  private async hotRestart() {
    const terminal = vscode.window.createTerminal('Flutter Fly - Hot Restart');
    terminal.show();
    terminal.sendText('R');
  }

  private async stopApp() {
    const terminal = vscode.window.createTerminal('Flutter Fly - Stop App');
    terminal.show();
    terminal.sendText('q');
  }

  private async cleanProject() {
    const terminal = vscode.window.createTerminal('Flutter Fly - Clean');
    terminal.show();
    terminal.sendText('flutter clean');
  }

  private showSuccessMessage(message: string) {
    vscode.window.showInformationMessage(message);
  }

  private showErrorMessage(message: string) {
    vscode.window.showErrorMessage(message);
  }
}
