// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'

import { ADBCommandsController } from './controllers/adb-controller'
import { ADBPathController } from './controllers/adb-path-controller'
import { FirebaseController } from './controllers/firebase-controller'
import { FlutterCommandsController } from './controllers/flutter-controller'
import { FlutterPanelController } from './controllers/flutter-panel-controller'
import { StatusBarController } from './controllers/status-bar-controller'

import { NetHelpers } from './domain/net-helpers'
import { ADBConnection } from './domain/adb-wrapper'
import { ADBPathManager } from './domain/adb-path-manager'
import { FirebaseManagerChannel } from './domain/firebase-channel'
import { ConsoleInterface } from './domain/console/console-interface'
import { ADBResolver } from './domain/adb-resolver'
import * as os from 'os'

// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Flutter Fly Extension Activated!')
    
    try {
        // Check if this is a Flutter project
        const hasFlutterProject = await checkForFlutterProject()
        vscode.commands.executeCommand('setContext', 'workspaceHasFlutterProject', hasFlutterProject)
        
        // Setup file watcher for dynamic Flutter project detection
        setupFlutterProjectWatcher(context)
        
        // Initialize core services
        const netHelper = new NetHelpers()
        const consoleInterface = new ConsoleInterface()
        
        // Auto-detect ADB path if not configured
        await autoDetectAndConfigureADB(context, consoleInterface)
        
        console.log('🔧 Flutter Fly: Initializing controllers...')
        
        // Initialize controllers in proper order to avoid conflicts
        
        // 0. Initialize StatusBar first to show device status
        console.log('📊 Flutter Fly: Initializing StatusBar Controller...')
        const statusBarController = new StatusBarController(context)
        await statusBarController.onInit()
        console.log('✅ StatusBar Controller initialized')
        
        // 1. First, initialize the main Flutter Panel Controller (handles most commands)
        console.log('📱 Flutter Fly: Initializing Flutter Panel Controller...')
        const flutterPanelController = new FlutterPanelController(context)
        await flutterPanelController.onInit()
        console.log('✅ Flutter Panel Controller initialized')
        
        // 2. Initialize Flutter Commands Controller (handles build and run commands)
        console.log('🚀 Flutter Fly: Initializing Flutter Commands Controller...')
        const flutterCommandsController = new FlutterCommandsController(context)
        await flutterCommandsController.onInit()
        console.log('✅ Flutter Commands Controller initialized')
        
        // 3. Initialize ADB and Device Management Controllers
        console.log('📱 Flutter Fly: Initializing ADB Controllers...')
        const firebaseController = new FirebaseController(
            context,
            new FirebaseManagerChannel(consoleInterface, context.globalState)
        )
        await firebaseController.onInit()
        console.log('✅ Firebase Controller initialized')
        
        const adbCmdController = new ADBCommandsController(
            context,
            new ADBConnection(consoleInterface, context.globalState, netHelper)
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
        vscode.window.showErrorMessage(`Failed to initialize Flutter Fly extension: ${error instanceof Error ? error.message : String(error)}`)
        
        // Show detailed error information
        if (error instanceof Error && error.message.includes('already exists')) {
            vscode.window.showErrorMessage('Command registration conflict detected. Please restart VSCode.')
        }
    }
}

/**
 * Auto-detect ADB path and configure it if not already set
 */
async function autoDetectAndConfigureADB(context: vscode.ExtensionContext, consoleInterface: ConsoleInterface) {
    try {
        // Check if ADB path is already configured
        const existingPath = context.globalState.get('user_adb_path')
        if (existingPath) {
            console.log('✅ ADB path already configured:', existingPath)
            return
        }

        console.log('🔍 Auto-detecting ADB path...')
        const adbResolver = new ADBResolver(os.homedir(), os.type(), consoleInterface, context.globalState)
        const detectedPath = await adbResolver.autoDetectADBPath()

        if (detectedPath) {
            console.log(`✅ Auto-detected ADB path: ${detectedPath}`)
            // Optionally auto-configure without asking user
            // await context.globalState.update('user_adb_path', detectedPath)
            // vscode.window.showInformationMessage(`Auto-detected ADB at: ${detectedPath}`)
        } else {
            console.log('⚠️ Could not auto-detect ADB path')
        }
    } catch (error) {
        console.error('Error during ADB auto-detection:', error)
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

/**
 * Setup file watcher for pubspec.yaml to dynamically update Flutter project detection
 */
function setupFlutterProjectWatcher(context: vscode.ExtensionContext) {
    const workspaceFolders = vscode.workspace.workspaceFolders
    if (!workspaceFolders) return

    // Watch for changes in pubspec.yaml files
    const fileWatcher = vscode.workspace.createFileSystemWatcher('**/pubspec.yaml')
    
    fileWatcher.onDidCreate(async () => {
        const hasFlutterProject = await checkForFlutterProject()
        vscode.commands.executeCommand('setContext', 'workspaceHasFlutterProject', hasFlutterProject)
        if (hasFlutterProject) {
            vscode.window.showInformationMessage('📱 Flutter project detected! Flutter Fly commands enabled.')
        }
    })
    
    fileWatcher.onDidDelete(async () => {
        const hasFlutterProject = await checkForFlutterProject()
        vscode.commands.executeCommand('setContext', 'workspaceHasFlutterProject', hasFlutterProject)
        if (!hasFlutterProject) {
            vscode.window.showWarningMessage('⚠️ Flutter project not found. Flutter Fly commands disabled.')
        }
    })
    
    context.subscriptions.push(fileWatcher)
}

// this method is called when your extension is deactivated
export function deactivate() {
  console.log('🔌 Flutter Fly Extension Deactivated')
  vscode.window.showInformationMessage('🔌 Flutter Fly Extension deactivated')
}