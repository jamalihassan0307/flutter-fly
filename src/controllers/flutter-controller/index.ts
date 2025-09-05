import * as vscode from 'vscode'
import { ADBBaseController } from '../adb-controller/ADBBaseController'

export class FlutterCommandsController extends ADBBaseController {
  constructor(context: vscode.ExtensionContext) {
    super(context)
  }

  async onInit() {
    // No commands registered here to avoid conflicts with FlutterPanelController
    // All Flutter commands are handled by FlutterPanelController
    // This controller only provides the implementation methods
    
    // logToDebug('FlutterCommandsController: Initialized (no commands registered to avoid conflicts)')
  }

  // Keep the methods for potential future use, but don't register them as commands
  // since they're already handled by FlutterPanelController
  
  async runFlutterDoctor() {
    // // logCommandExecution('flutter doctor', 'started')
    try {
      await this.showProgress('Running Flutter Doctor...', async () => {
        const terminal = vscode.window.createTerminal('Flutter Doctor')
        terminal.show()
        terminal.sendText('flutter doctor')
      })
      // // logCommandExecution('flutter doctor', 'completed', 'Flutter Doctor completed successfully')
      vscode.window.showInformationMessage('✅ Flutter Doctor completed! Check terminal for results.')
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e)
      // // logCommandExecution('flutter doctor', 'failed', undefined, errorMessage)
      // // logToError('Flutter Doctor failed', e instanceof Error ? e : new Error(String(e)))
      this.genericErrorReturn(e instanceof Error ? e : new Error(String(e)))
    }
  }

  async getPackages() {
    // logPackageInstallation('Flutter packages', 'started')
    // // logCommandExecution('flutter pub get', 'started')
    try {
      await this.showProgress('Getting Flutter packages...', async () => {
        const terminal = vscode.window.createTerminal('Flutter Packages')
        terminal.show()
        terminal.sendText('flutter pub get')
      })
      // logPackageInstallation('Flutter packages', 'completed', 'All packages installed successfully')
      // // logCommandExecution('flutter pub get', 'completed', 'Packages updated successfully')
      vscode.window.showInformationMessage('✅ Flutter packages updated!')
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e)
      // logPackageInstallation('Flutter packages', 'failed', errorMessage)
      // // logCommandExecution('flutter pub get', 'failed', undefined, errorMessage)
      // // logToError('Flutter packages installation failed', e instanceof Error ? e : new Error(String(e)))
      this.genericErrorReturn(e instanceof Error ? e : new Error(String(e)))
    }
  }

  async upgradePackages() {
    // logPackageInstallation('Flutter packages (upgrade)', 'started')
    // // logCommandExecution('flutter pub upgrade', 'started')
    try {
      await this.showProgress('Upgrading Flutter packages...', async () => {
        const terminal = vscode.window.createTerminal('Flutter Package Upgrade')
        terminal.show()
        terminal.sendText('flutter pub upgrade')
      })
      // logPackageInstallation('Flutter packages (upgrade)', 'completed', 'All packages upgraded successfully')
      // // logCommandExecution('flutter pub upgrade', 'completed', 'Packages upgraded successfully')
      vscode.window.showInformationMessage('⬆ Flutter packages upgraded!')
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e)
      // logPackageInstallation('Flutter packages (upgrade)', 'failed', errorMessage)
      // // logCommandExecution('flutter pub upgrade', 'failed', undefined, errorMessage)
      // // logToError('Flutter packages upgrade failed', e instanceof Error ? e : new Error(String(e)))
      this.genericErrorReturn(e instanceof Error ? e : new Error(String(e)))
    }
  }

  async buildAPK() {
    try {
      const buildMode = await this.selectBuildMode()
      if (!buildMode) {
        // logToDebug('APK build cancelled by user')
        return
      }

      // // logCommandExecution(flutter build apk --${buildMode}, 'started')
      await this.showProgress(`Building APK in ${buildMode} mode...`, async () => {
        const terminal = vscode.window.createTerminal('Flutter Build APK')
        terminal.show()
        terminal.sendText(`flutter build apk --${buildMode}`)
      })
      // // logCommandExecution(flutter build apk --${buildMode}, 'completed', APK built successfully in ${buildMode} mode)
      vscode.window.showInformationMessage(`✅ APK built successfully in ${buildMode} mode!`  )
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e)
      // // logCommandExecution('flutter build apk', 'failed', undefined, errorMessage)
      //  // logToError('APK build failed', e instanceof Error ? e : new Error(String(e)))
      this.genericErrorReturn(e instanceof Error ? e : new Error(String(e)))
    }
  }

  async buildAppBundle() {
    try {
      const buildMode = await this.selectBuildMode()
      if (!buildMode) {
        // logToDebug('AAB build cancelled by user')
        return
      }

      // // logCommandExecution(flutter build appbundle --${buildMode}, 'started')
      await this.showProgress(`Building App Bundle (AAB) in ${buildMode} mode...`, async () => {
        const terminal = vscode.window.createTerminal('Flutter Build AAB')
        terminal.show()
        terminal.sendText(`flutter build appbundle --${buildMode}`)
      })
      // logCommandExecution(flutter build appbundle --${buildMode}, 'completed', App Bundle built successfully in ${buildMode} mode)
      vscode.window.showInformationMessage(`✅ App Bundle (AAB) built successfully in ${buildMode} mode!`)
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e)
      // logCommandExecution('flutter build appbundle', 'failed', undefined, errorMessage)
      // logToError('App Bundle build failed', e instanceof Error ? e : new Error(String(e)))
      this.genericErrorReturn(e instanceof Error ? e : new Error(String(e)))
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
        // logCommandExecution('flutter clean', 'started')
        await this.showProgress('Cleaning Flutter project...', async () => {
          const terminal = vscode.window.createTerminal('Flutter Clean')
          terminal.show()
          terminal.sendText('flutter clean')
        })
        // logCommandExecution('flutter clean', 'completed', 'Flutter project cleaned successfully')
        vscode.window.showInformationMessage('🧹 Flutter project cleaned!')
      } else {
        // logToDebug('Flutter clean cancelled by user')
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e)
      // logCommandExecution('flutter clean', 'failed', undefined, errorMessage)
      // logToError('Flutter clean failed', e instanceof Error ? e : new Error(String(e)))
      this.genericErrorReturn(e instanceof Error ? e : new Error(String(e)))
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