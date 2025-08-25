import * as vscode from 'vscode'
import { ADBBaseController } from '../adb-controller/ADBBaseController'

export class FlutterCommandsController extends ADBBaseController {
  constructor(context: vscode.ExtensionContext) {
    super(context)
  }

  async onInit() {
    // Only register commands that are NOT handled by FlutterPanelController
    // to avoid conflicts. Keep only essential ADB and build commands.
    
    // No commands needed here - all Flutter commands are handled by FlutterPanelController
    // This controller is kept for future use but doesn't register any commands
    console.log('🔧 FlutterCommandsController: No commands to register (handled by FlutterPanelController)')
  }

  // Keep the methods for potential future use, but don't register them as commands
  // since they're already handled by FlutterPanelController
  
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
