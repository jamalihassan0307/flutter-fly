import * as vscode from 'vscode'
import { ADBBaseController } from '../adb-controller/ADBBaseController'
import { ADBConnection } from '../../domain/adb-wrapper'
import { ConsoleInterface } from '../../domain/console/console-interface'
import { NetHelpers } from '../../domain/net-helpers'

export class StatusBarController extends ADBBaseController {
  private statusBarItem: vscode.StatusBarItem
  private adbConnection: ADBConnection
  private refreshInterval: NodeJS.Timeout | undefined

  constructor(context: vscode.ExtensionContext) {
    super(context)
    
    // Create status bar item
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    )
    this.statusBarItem.command = 'flutterFly.showConnectedDevices'
    this.statusBarItem.tooltip = 'Click to view connected devices'
    this.statusBarItem.show()
    context.subscriptions.push(this.statusBarItem)
    
    // Initialize ADB connection for device detection
    const consoleInterface = new ConsoleInterface()
    const netHelper = new NetHelpers()
    this.adbConnection = new ADBConnection(consoleInterface, context.globalState, netHelper)
  }

  async onInit() {
    // Register command for quick connect from status bar
    this.registerCommand('flutterFly.quickConnect', () => this.quickConnect())
    
    // Initial device check
    await this.updateDeviceStatus()
    
    // Start periodic refresh (every 30 seconds)
    this.startPeriodicRefresh()
  }

  async updateDeviceStatus() {
    try {
      const devices = await this.adbConnection.FindConnectedDevices()
      
      if (devices && devices.length > 0) {
        // Extract device info from the first device
        const firstDevice = devices[0]
        const deviceParts = firstDevice.split('|')
        const deviceInfo = deviceParts.length > 0 ? deviceParts[0].trim() : firstDevice
        
        this.statusBarItem.text = `$(device-mobile) ${deviceInfo}`
        this.statusBarItem.backgroundColor = undefined
        this.statusBarItem.tooltip = `Connected to ${deviceInfo}\nClick to view all devices or quick connect`
      } else {
        this.statusBarItem.text = '$(device-mobile) No Device'
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground')
        this.statusBarItem.tooltip = 'No devices connected\nClick to connect a device'
      }
    } catch (error) {
      // ADB not found or error - show offline status
      this.statusBarItem.text = '$(device-mobile) Offline'
      this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground')
      this.statusBarItem.tooltip = 'ADB not available\nClick to configure ADB path'
    }
  }

  async quickConnect() {
    // Show quick pick menu with options
    const selected = await vscode.window.showQuickPick([
      {
        label: '$(device-mobile) Connect Wireless Device',
        description: 'Connect to a device via IP',
        action: 'connect'
      },
      {
        label: '$(list-unordered) View Connected Devices',
        description: 'Show all connected devices',
        action: 'view'
      },
      {
        label: '$(tools) Open Setup Guide',
        description: 'Device configuration help',
        action: 'setup'
      }
    ])

    if (!selected) return

    switch (selected.action) {
      case 'connect':
        await vscode.commands.executeCommand('flutterFly.connectWirelessDevice')
        break
      case 'view':
        await vscode.commands.executeCommand('flutterFly.showConnectedDevices')
        break
      case 'setup':
        await vscode.commands.executeCommand('flutterFly.showTroubleshootingGuide')
        break
    }

    // Refresh status after action
    setTimeout(() => this.updateDeviceStatus(), 2000)
  }

  private startPeriodicRefresh() {
    // Clear any existing interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }

    // Refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.updateDeviceStatus()
    }, 30000)
  }

  async dispose() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
    this.statusBarItem.dispose()
  }
}

