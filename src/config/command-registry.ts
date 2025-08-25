/**
 * Command Registry for Flutter Fly Extension
 * This file makes it easy to add, edit, and delete commands
 */

export interface FlutterFlyCommand {
  id: string;
  title: string;
  category: string;
  description?: string;
}

export const FLUTTER_FLY_COMMANDS: FlutterFlyCommand[] = [
  // Panel Commands
  {
    id: 'flutterFly.openFlutterPanel',
    title: '🚀 Open Flutter Fly Panel',
    category: 'Flutter Fly',
    description: 'Open the main Flutter Fly panel interface'
  },
  {
    id: 'flutterFly.connectWirelessDevice',
    title: '📱 Connect Wireless Device',
    category: 'Flutter Fly',
    description: 'Connect to a wireless Android device'
  },
  {
    id: 'flutterFly.showConnectedDevices',
    title: '🔍 Show Connected Devices',
    category: 'Flutter Fly',
    description: 'Display list of connected devices'
  },

  // Flutter Development Commands
  {
    id: 'flutterFly.runFlutterDoctor',
    title: '⚡ Flutter Doctor',
    category: 'Flutter Fly',
    description: 'Run Flutter doctor to check installation'
  },
  {
    id: 'flutterFly.getPackages',
    title: '📦 Get Packages',
    category: 'Flutter Fly',
    description: 'Get Flutter packages and dependencies'
  },
  {
    id: 'flutterFly.upgradePackages',
    title: '⬆️ Upgrade Packages',
    category: 'Flutter Fly',
    description: 'Upgrade Flutter packages to latest versions'
  },
  {
    id: 'flutterFly.cleanProject',
    title: '🧹 Clean Project',
    category: 'Flutter Fly',
    description: 'Clean Flutter project build files'
  },
  {
    id: 'flutterFly.analyzeProject',
    title: '🔍 Analyze Project',
    category: 'Flutter Fly',
    description: 'Analyze Flutter project for issues'
  },
  {
    id: 'flutterFly.formatCode',
    title: '✨ Format Code',
    category: 'Flutter Fly',
    description: 'Format Flutter/Dart code'
  },

  // Building Commands
  {
    id: 'flutterFly.buildAPK',
    title: '🏗️ Build APK',
    category: 'Flutter Fly',
    description: 'Build Android APK file'
  },
  {
    id: 'flutterFly.buildAppBundle',
    title: '📱 Build App Bundle (AAB)',
    category: 'Flutter Fly',
    description: 'Build Android App Bundle'
  },
  {
    id: 'flutterFly.buildIOS',
    title: '🍎 Build iOS',
    category: 'Flutter Fly',
    description: 'Build iOS app'
  },
  {
    id: 'flutterFly.buildWeb',
    title: '🌐 Build Web',
    category: 'Flutter Fly',
    description: 'Build web app'
  },

  // Running Commands
  {
    id: 'flutterFly.runFlutterApp',
    title: '🚀 Run Flutter App',
    category: 'Flutter Fly',
    description: 'Run Flutter app on connected device'
  },
  {
    id: 'flutterFly.buildFlutterApp',
    title: '🏗️ Build Flutter App',
    category: 'Flutter Fly',
    description: 'Build Flutter app with options'
  },
  {
    id: 'flutterFly.hotReload',
    title: '🔄 Hot Reload',
    category: 'Flutter Fly',
    description: 'Hot reload the running app'
  },
  {
    id: 'flutterFly.hotRestart',
    title: '🔄 Hot Restart',
    category: 'Flutter Fly',
    description: 'Hot restart the running app'
  },
  {
    id: 'flutterFly.stopApp',
    title: '⏹️ Stop App',
    category: 'Flutter Fly',
    description: 'Stop the running Flutter app'
  },

  // Advanced Commands
  {
    id: 'flutterFly.injectResources',
    title: '💉 Inject Resources',
    category: 'Flutter Fly',
    description: 'Run build_runner for code generation'
  },
  {
    id: 'flutterFly.upgradeFlutterSDK',
    title: '⬆️ Upgrade Flutter SDK',
    category: 'Flutter Fly',
    description: 'Upgrade Flutter SDK to latest version'
  },

  // ADB Commands
  {
    id: 'flutterFly.killserver',
    title: '⚠️ Kill ADB Server',
    category: 'Flutter Fly',
    description: 'Kill ADB server'
  },

  // Firebase Commands
  {
    id: 'flutterFly.enableFirebaseDebug',
    title: '🔥 Enable Firebase Debug',
    category: 'Flutter Fly',
    description: 'Enable Firebase events debug mode'
  },
  {
    id: 'flutterFly.disableFirebaseDebug',
    title: '🔥 Disable Firebase Debug',
    category: 'Flutter Fly',
    description: 'Disable Firebase events debug mode'
  }
];

/**
 * Helper function to get commands by category
 */
export function getCommandsByCategory(category: string): FlutterFlyCommand[] {
  return FLUTTER_FLY_COMMANDS.filter(cmd => cmd.category === category);
}

/**
 * Helper function to get all command IDs
 */
export function getAllCommandIds(): string[] {
  return FLUTTER_FLY_COMMANDS.map(cmd => cmd.id);
}

/**
 * Helper function to find a command by ID
 */
export function findCommandById(id: string): FlutterFlyCommand | undefined {
  return FLUTTER_FLY_COMMANDS.find(cmd => cmd.id === id);
}
