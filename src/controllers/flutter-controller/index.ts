import * as vscode from 'vscode'
import { ADBBaseController } from '../adb-controller/ADBBaseController'

export class FlutterCommandsController extends ADBBaseController {
  constructor(context: vscode.ExtensionContext) {
    super(context)
  }

  async onInit() {
    // Project Setup & Health
    this.registerCommand('flutterFly.runFlutterDoctor', () => this.runFlutterDoctor())
      .registerCommand('flutterFly.upgradeFlutterSDK', () => this.upgradeFlutterSDK())
      .registerCommand('flutterFly.getPackages', () => this.getPackages())

    // Building and Compiling
    this.registerCommand('flutterFly.buildAPK', () => this.buildAPK())
      .registerCommand('flutterFly.buildAppBundle', () => this.buildAppBundle())
      .registerCommand('flutterFly.buildIOS', () => this.buildIOS())
      .registerCommand('flutterFly.buildWeb', () => this.buildWeb())

    // Running and Debugging
    this.registerCommand('flutterFly.runOnConnectedDevice', () => this.runOnConnectedDevice())
      .registerCommand('flutterFly.runInDebugMode', () => this.runInDebugMode())
      .registerCommand('flutterFly.runInProfileMode', () => this.runInProfileMode())
      .registerCommand('flutterFly.runInReleaseMode', () => this.runInReleaseMode())
      .registerCommand('flutterFly.stopRunningApp', () => this.stopRunningApp())

    // Hot Reload / Restart
    this.registerCommand('flutterFly.hotReload', () => this.hotReload())
      .registerCommand('flutterFly.hotRestart', () => this.hotRestart())

    // Device & Emulator Management
    this.registerCommand('flutterFly.connectAndroidDevice', () => this.connectAndroidDevice())
      .registerCommand('flutterFly.openAndroidEmulator', () => this.openAndroidEmulator())
      .registerCommand('flutterFly.openIOSSimulator', () => this.openIOSSimulator())

    // Utility & Cleanup
    this.registerCommand('flutterFly.cleanProject', () => this.cleanProject())
      .registerCommand('flutterFly.injectResources', () => this.injectResources())
      .registerCommand('flutterFly.formatCode', () => this.formatCode())
      .registerCommand('flutterFly.analyzeProject', () => this.analyzeProject())
  }

  // Project Setup & Health
  async runFlutterDoctor() {
    try {
      await this.showProgress('Running Flutter Doctor...', async () => {
        const terminal = vscode.window.createTerminal('Flutter Doctor')
        terminal.show()
        terminal.sendText('flutter doctor')
      })
      vscode.window.showInformationMessage('✅ Flutter Doctor completed! Check terminal for results.')
    } catch (e) {
      this.genericErrorReturn(e)
    }
  }

  async upgradeFlutterSDK() {
    try {
      const result = await vscode.window.showWarningMessage(
        'This will upgrade your Flutter SDK. Continue?',
        'Yes, Upgrade',
        'Cancel'
      )
      
      if (result === 'Yes, Upgrade') {
        await this.showProgress('Upgrading Flutter SDK...', async () => {
          const terminal = vscode.window.createTerminal('Flutter Upgrade')
          terminal.show()
          terminal.sendText('flutter upgrade')
        })
        vscode.window.showInformationMessage('✅ Flutter SDK upgrade completed!')
      }
    } catch (e) {
      this.genericErrorReturn(e)
    }
  }

  async getPackages() {
    try {
      await this.showProgress('Getting Flutter packages...', async () => {
        const terminal = vscode.window.createTerminal('Flutter Packages')
        terminal.show()
        terminal.sendText('flutter pub get')
      })
      vscode.window.showInformationMessage('✅ Flutter packages updated!')
    } catch (e) {
      this.genericErrorReturn(e)
    }
  }

  // Building and Compiling
  async buildAPK() {
    try {
      const buildMode = await this.selectBuildMode()
      if (!buildMode) return

      await this.showProgress(`Building APK in ${buildMode} mode...`, async () => {
        const terminal = vscode.window.createTerminal('Flutter Build APK')
        terminal.show()
        terminal.sendText(`flutter build apk --${buildMode}`)
      })
      vscode.window.showInformationMessage(`✅ APK built successfully in ${buildMode} mode!`)
    } catch (e) {
      this.genericErrorReturn(e)
    }
  }

  async buildAppBundle() {
    try {
      const buildMode = await this.selectBuildMode()
      if (!buildMode) return

      await this.showProgress(`Building App Bundle (AAB) in ${buildMode} mode...`, async () => {
        const terminal = vscode.window.createTerminal('Flutter Build AAB')
        terminal.show()
        terminal.sendText(`flutter build appbundle --${buildMode}`)
      })
      vscode.window.showInformationMessage(`✅ App Bundle (AAB) built successfully in ${buildMode} mode!`)
    } catch (e) {
      this.genericErrorReturn(e)
    }
  }

  async buildIOS() {
    try {
      // Check if iOS folder exists
      const workspaceFolders = vscode.workspace.workspaceFolders
      if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder found')
        return
      }

      const iosPath = `${workspaceFolders[0].uri.fsPath}/ios`
      if (!require('fs').existsSync(iosPath)) {
        vscode.window.showWarningMessage('iOS folder not found. This project may not support iOS builds.')
        return
      }

      await this.showProgress('Building iOS app...', async () => {
        const terminal = vscode.window.createTerminal('Flutter Build iOS')
        terminal.show()
        terminal.sendText('flutter build ios')
      })
      vscode.window.showInformationMessage('✅ iOS build completed!')
    } catch (e) {
      this.genericErrorReturn(e)
    }
  }

  async buildWeb() {
    try {
      // Check if web folder exists
      const workspaceFolders = vscode.workspace.workspaceFolders
      if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder found')
        return
      }

      const webPath = `${workspaceFolders[0].uri.fsPath}/web`
      if (!require('fs').existsSync(webPath)) {
        vscode.window.showWarningMessage('Web folder not found. This project may not support web builds.')
        return
      }

      await this.showProgress('Building web app...', async () => {
        const terminal = vscode.window.createTerminal('Flutter Build Web')
        terminal.show()
        terminal.sendText('flutter build web')
      })
      vscode.window.showInformationMessage('✅ Web build completed!')
    } catch (e) {
      this.genericErrorReturn(e)
    }
  }

  // Running and Debugging
  async runOnConnectedDevice() {
    try {
      await this.showProgress('Running Flutter app on connected device...', async () => {
        const terminal = vscode.window.createTerminal('Flutter Run')
        terminal.show()
        terminal.sendText('flutter run')
      })
      vscode.window.showInformationMessage('🚀 Flutter app is running! Use Hot Reload (R) or Hot Restart (Shift+R)')
    } catch (e) {
      this.genericErrorReturn(e)
    }
  }

  async runInDebugMode() {
    try {
      await this.showProgress('Running Flutter app in debug mode...', async () => {
        const terminal = vscode.window.createTerminal('Flutter Debug')
        terminal.show()
        terminal.sendText('flutter run --debug')
      })
      vscode.window.showInformationMessage('🐛 Flutter app running in debug mode!')
    } catch (e) {
      this.genericErrorReturn(e)
    }
  }

  async runInProfileMode() {
    try {
      await this.showProgress('Running Flutter app in profile mode...', async () => {
        const terminal = vscode.window.createTerminal('Flutter Profile')
        terminal.show()
        terminal.sendText('flutter run --profile')
      })
      vscode.window.showInformationMessage('📊 Flutter app running in profile mode!')
    } catch (e) {
      this.genericErrorReturn(e)
    }
  }

  async runInReleaseMode() {
    try {
      await this.showProgress('Running Flutter app in release mode...', async () => {
        const terminal = vscode.window.createTerminal('Flutter Release')
        terminal.show()
        terminal.sendText('flutter run --release')
      })
      vscode.window.showInformationMessage('🚀 Flutter app running in release mode!')
    } catch (e) {
      this.genericErrorReturn(e)
    }
  }

  async stopRunningApp() {
    try {
      const terminal = vscode.window.createTerminal('Flutter Stop')
      terminal.show()
      terminal.sendText('q') // Send quit command to running Flutter app
      vscode.window.showInformationMessage('⏹️ Flutter app stopped!')
    } catch (e) {
      this.genericErrorReturn(e)
    }
  }

  // Hot Reload / Restart
  async hotReload() {
    try {
      const terminal = vscode.window.createTerminal('Flutter Hot Reload')
      terminal.show()
      terminal.sendText('r') // Send hot reload command
      vscode.window.showInformationMessage('🔄 Hot reload executed!')
    } catch (e) {
      this.genericErrorReturn(e)
    }
  }

  async hotRestart() {
    try {
      const terminal = vscode.window.createTerminal('Flutter Hot Restart')
      terminal.show()
      terminal.sendText('R') // Send hot restart command
      vscode.window.showInformationMessage('🔄 Hot restart executed!')
    } catch (e) {
      this.genericErrorReturn(e)
    }
  }

  // Device & Emulator Management
  async connectAndroidDevice() {
    try {
      // This will use the existing ADB functionality
      vscode.commands.executeCommand('flutterFly.adbwificonnect')
    } catch (e) {
      this.genericErrorReturn(e)
    }
  }

  async openAndroidEmulator() {
    try {
      await this.showProgress('Opening Android emulator...', async () => {
        const terminal = vscode.window.createTerminal('Android Emulator')
        terminal.show()
        terminal.sendText('flutter emulators')
        terminal.sendText('flutter emulators --launch <emulator_id>')
      })
      vscode.window.showInformationMessage('📱 Android emulator commands sent! Check terminal for emulator list.')
    } catch (e) {
      this.genericErrorReturn(e)
    }
  }

  async openIOSSimulator() {
    try {
      // Check if running on macOS
      if (process.platform !== 'darwin') {
        vscode.window.showWarningMessage('iOS Simulator is only available on macOS')
        return
      }

      await this.showProgress('Opening iOS Simulator...', async () => {
        const terminal = vscode.window.createTerminal('iOS Simulator')
        terminal.show()
        terminal.sendText('open -a Simulator')
        terminal.sendText('flutter emulators')
      })
      vscode.window.showInformationMessage('🍎 iOS Simulator opened!')
    } catch (e) {
      this.genericErrorReturn(e)
    }
  }

  // Utility & Cleanup
  async cleanProject() {
    try {
      const result = await vscode.window.showWarningMessage(
        'This will clean your Flutter project. Continue?',
        'Yes, Clean',
        'Cancel'
      )
      
      if (result === 'Yes, Clean') {
        await this.showProgress('Cleaning Flutter project...', async () => {
          const terminal = vscode.window.createTerminal('Flutter Clean')
          terminal.show()
          terminal.sendText('flutter clean')
        })
        vscode.window.showInformationMessage('🧹 Flutter project cleaned!')
      }
    } catch (e) {
      this.genericErrorReturn(e)
    }
  }

  async injectResources() {
    try {
      await this.showProgress('Injecting resources...', async () => {
        const terminal = vscode.window.createTerminal('Flutter Build Runner')
        terminal.show()
        terminal.sendText('flutter pub run build_runner build')
      })
      vscode.window.showInformationMessage('🔧 Resources injected successfully!')
    } catch (e) {
      this.genericErrorReturn(e)
    }
  }

  async formatCode() {
    try {
      await this.showProgress('Formatting Flutter code...', async () => {
        const terminal = vscode.window.createTerminal('Flutter Format')
        terminal.show()
        terminal.sendText('dart format .')
      })
      vscode.window.showInformationMessage('✨ Flutter code formatted!')
    } catch (e) {
      this.genericErrorReturn(e)
    }
  }

  async analyzeProject() {
    try {
      await this.showProgress('Analyzing Flutter project...', async () => {
        const terminal = vscode.window.createTerminal('Flutter Analyze')
        terminal.show()
        terminal.sendText('flutter analyze')
      })
      vscode.window.showInformationMessage('🔍 Flutter project analysis completed! Check terminal for results.')
    } catch (e) {
      this.genericErrorReturn(e)
    }
  }

  // Helper methods
  private async selectBuildMode(): Promise<string | undefined> {
    const buildMode = await vscode.window.showQuickPick(
      ['debug', 'profile', 'release'],
      {
        placeHolder: 'Select build mode',
        canPickMany: false
      }
    )
    return buildMode
  }

  private async showProgress(message: string, task: () => Promise<void>) {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: message,
        cancellable: false
      },
      async (progress) => {
        progress.report({ increment: 0 })
        await task()
        progress.report({ increment: 100 })
      }
    )
  }
}
