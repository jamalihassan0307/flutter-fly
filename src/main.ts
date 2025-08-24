// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'

import { ADBCommandsController } from './controllers/adb-controller'
import { ADBPathController } from './controllers/adb-path-controller'
import { FirebaseController } from './controllers/firebase-controller'
import { FlutterCommandsController } from './controllers/flutter-controller'
import { FlutterPanelController } from './controllers/flutter-panel-controller';

import { NetHelpers } from './domain/net-helpers'
import { ADBConnection } from './domain/adb-wrapper'
import { ADBPathManager } from './domain/adb-path-manager'
import { FirebaseManagerChannel } from './domain/firebase-channel'
import { ConsoleInterface } from './domain/console/console-interface'

// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Flutter Fly Extension Activated!')
    
    // Check if this is a Flutter project
    const hasFlutterProject = await checkForFlutterProject()
    vscode.commands.executeCommand('setContext', 'workspaceHasFlutterProject', hasFlutterProject)
    
    // Register all controllers used by plugin
    const netHelper = new NetHelpers()
    
    try {
        // Initialize controllers in sequence to avoid conflicts
        console.log('🔧 Initializing Flutter Fly controllers...')
        
        // 1. Flutter Panel Controller (registers panel commands)
        const flutterPanelController = new FlutterPanelController(context)
        await flutterPanelController.onInit()
        console.log('✅ Flutter Panel Controller initialized')
        
        // 2. Flutter Commands Controller (registers Flutter commands)
        const flutterCommandsController = new FlutterCommandsController(context)
        await flutterCommandsController.onInit()
        console.log('✅ Flutter Commands Controller initialized')
        
        // 3. ADB and Device Management Controllers
        const firebaseController = new FirebaseController(
            context,
            new FirebaseManagerChannel(new ConsoleInterface(), context.globalState)
        )
        await firebaseController.onInit()
        console.log('✅ Firebase Controller initialized')
        
        const adbCmdController = new ADBCommandsController(
            context,
            new ADBConnection(new ConsoleInterface(), context.globalState, netHelper)
        )
        await adbCmdController.onInit()
        console.log('✅ ADB Commands Controller initialized')
        
        const adbPathController = new ADBPathController(
            context,
            new ADBPathManager(context.globalState)
        )
        await adbPathController.onInit()
        console.log('✅ ADB Path Controller initialized')
        
        console.log('✅ All Flutter Fly controllers registered successfully')
        
        // Show welcome message
        vscode.window.showInformationMessage(
            '🚀 Flutter Fly is now active! Your ultimate Flutter development companion.',
            'View Commands',
            'Open Flutter Panel'
        ).then(selection => {
            if (selection === 'View Commands') {
                vscode.commands.executeCommand('workbench.action.showCommands')
            } else if (selection === 'Open Flutter Panel') {
                vscode.commands.executeCommand('flutterFly.openFlutterPanel')
            }
        })
    } catch (error) {
        console.error('❌ Error initializing Flutter Fly controllers:', error)
        vscode.window.showErrorMessage('Failed to initialize Flutter Fly extension. Check console for details.')
    }
}

async function checkForFlutterProject(): Promise<boolean> {
    const workspaceFolders = vscode.workspace.workspaceFolders
    if (!workspaceFolders) return false
    
    for (const folder of workspaceFolders) {
        const pubspecPath = vscode.Uri.joinPath(folder.uri, 'pubspec.yaml')
        try {
            const stat = await vscode.workspace.fs.stat(pubspecPath)
            if (stat) {
                return true
            }
        } catch {
            // File doesn't exist, continue checking
        }
    }
    return false
}

// this method is called when your extension is deactivated
export function deactivate() {
  console.log('🔌 Flutter Fly Extension Deactivated')
  vscode.window.showInformationMessage('🔌 Flutter Fly Extension deactivated')
}
