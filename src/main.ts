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

const registered = {}

// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Flutter Fly Extension Activated!')
    
    // Register all controllers used by plugin
    const netHelper = new NetHelpers()
    
    // Flutter Development Controllers
    registered['flutterCommandsController'] = new FlutterCommandsController(context)
    
    // New Flutter Panel Controller
    registered['flutterPanelController'] = new FlutterPanelController(context)
    
    // ADB and Device Management Controllers
    registered['firebaseController'] = new FirebaseController(
        context,
        new FirebaseManagerChannel(new ConsoleInterface(), context.globalState)
    )
    registered['adbCmdController'] = new ADBCommandsController(
        context,
        new ADBConnection(new ConsoleInterface(), context.globalState, netHelper)
    )
    registered['adbPathController'] = new ADBPathController(
        context,
        new ADBPathManager(context.globalState)
    )
    
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
}

// this method is called when your extension is deactivated
export function deactivate() {
  console.log('🔌 Flutter Fly Extension Deactivated')
  vscode.window.showInformationMessage('🔌 Flutter Fly Extension deactivated')
}
