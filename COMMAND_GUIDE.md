# Flutter Fly Command Management Guide

This guide explains how to add, edit, and delete commands in the Flutter Fly extension.

## 🚀 Quick Start

### Adding a New Command

1. **Add to Command Registry** (`src/config/command-registry.ts`):
```typescript
{
  id: 'flutterFly.yourNewCommand',
  title: '🎯 Your Command Title',
  category: 'Flutter Fly',
  description: 'Description of what this command does'
}
```

2. **Add to package.json** (`package.json`):
```json
{
  "command": "flutterFly.yourNewCommand",
  "title": "🎯 Your Command Title",
  "category": "Flutter Fly"
}
```

3. **Add to activationEvents** (`package.json`):
```json
"onCommand:flutterFly.yourNewCommand"
```

4. **Implement the command** in the appropriate controller:
```typescript
// In the controller's onInit method
this.registerCommand('flutterFly.yourNewCommand', () => this.yourNewCommand())

// Add the method
async yourNewCommand() {
  // Your command implementation here
}
```

### Editing an Existing Command

1. **Update the command registry** (`src/config/command-registry.ts`)
2. **Update package.json** if title or category changes
3. **Update the implementation** in the controller

### Deleting a Command

1. **Remove from command registry** (`src/config/command-registry.ts`)
2. **Remove from package.json** commands section
3. **Remove from activationEvents** in package.json
4. **Remove implementation** from the controller

## 📁 File Structure

```
src/
├── config/
│   ├── command-registry.ts    # Central command definitions
│   └── global-state-keys.ts   # State management keys
├── controllers/
│   ├── flutter-controller/    # Flutter-specific commands
│   ├── adb-controller/        # ADB device commands
│   ├── firebase-controller/   # Firebase commands
│   └── flutter-panel-controller/ # Panel interface commands
├── domain/
│   ├── adb-resolver/          # ADB path detection and management
│   ├── adb-wrapper/           # ADB command execution
│   └── console/               # Console interface implementations
└── main.ts                    # Extension activation
```

## 🔧 Command Categories

- **Panel Commands**: Interface and navigation commands
- **Flutter Commands**: Flutter development workflow commands
- **ADB Commands**: Android device management commands
- **Firebase Commands**: Firebase debugging commands

## 📝 Example: Adding a New Flutter Command

Let's say you want to add a "Format Code" command:

### 1. Update Command Registry
```typescript
// In src/config/command-registry.ts
{
  id: 'flutterFly.formatCode',
  title: '✨ Format Code',
  category: 'Flutter Fly',
  description: 'Format Flutter/Dart code'
}
```

### 2. Update package.json
```json
// In commands array
{
  "command": "flutterFly.formatCode",
  "title": "✨ Format Code",
  "category": "Flutter Fly"
}

// In activationEvents array
"onCommand:flutterFly.formatCode"
```

### 3. Implement in Controller
```typescript
// In src/controllers/flutter-controller/index.ts
async onInit() {
  this.registerCommand('flutterFly.formatCode', () => this.formatCode())
    // ... other commands
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
```

## 🚨 Common Issues

### Command Already Exists Error
- Check if the command ID is already registered
- Ensure controllers are initialized in the correct order
- Use unique command IDs
- **Fixed in v1.0.3**: Controller initialization order has been optimized

### Command Not Found Error
- Verify the command is in package.json
- Check activationEvents includes the command
- Ensure the command is properly registered in a controller
- **Fixed in v1.0.3**: All commands are now properly registered

### Sidebar Not Updating
- Check if the command is in the viewsWelcome buttons array
- Verify the when condition is correct
- Ensure the command ID matches exactly
- **Fixed in v1.0.3**: Sidebar welcome view now uses proper button format

### Extension Won't Start
- Check console for initialization errors
- Verify all controllers are properly initialized
- Ensure no duplicate command registrations
- **Fixed in v1.0.3**: Controller lifecycle management improved

## 🔄 Testing Commands

1. **Compile the extension**:
   ```bash
   npm run compile
   ```

2. **Press F5** in VSCode to launch extension development host

3. **Test your command** using:
   - Command Palette (Ctrl+Shift+P)
   - Sidebar buttons
   - Panel interface buttons

## 📚 Best Practices

1. **Use descriptive command IDs** that follow the `flutterFly.verbNoun` pattern
2. **Group related commands** in the same controller
3. **Provide clear titles** with emojis for visual appeal
4. **Add descriptions** to help users understand command purpose
5. **Test commands thoroughly** before committing changes
6. **Update documentation** when adding new commands
7. **Handle errors gracefully** with user-friendly messages
8. **Use proper TypeScript types** for better code quality

## 🆘 Need Help?

- Check the console for error messages
- Verify all files are properly saved and compiled
- Ensure command IDs are unique across the entire extension
- Test in a clean VSCode window
- **New in v1.0.5**: Better error logging and debugging information

## 🔧 New in v1.0.6

### **Enhanced User Interface**
- **Beautiful Panel Interface**: Completely redesigned webview panel with modern UI
- **Improved Sidebar**: Better organized sidebar with enhanced quick actions
- **Better Visual Hierarchy**: Cleaner layout with improved button organization
- **Responsive Design**: Mobile-friendly responsive layout with Bootstrap 5
- **Social Integration**: GitHub, LinkedIn, and Portfolio links with hover effects

### **Technical Improvements**
- **Command Registration**: Fixed command registration issues for packaged extensions
- **Activation Events**: Improved extension activation with better event handling
- **Error Handling**: Enhanced error handling and user feedback
- **Debug Logging**: Added comprehensive logging for better debugging
- **Extension Stability**: Improved overall extension stability and reliability

### **Bug Fixes**
- **Packaging Issues**: Fixed extension packaging issues that prevented commands from working
- **Webview Assets**: Fixed webview asset loading issues in packaged extensions
- **Activation Problems**: Resolved extension activation problems when installed from package

## 🔧 New in v1.0.5

### **Logo and Visual Updates**
- **New Logo Design**: Fresh, modern logo design for better brand recognition
- **Visual Refresh**: Enhanced visual identity and branding
- **Asset Updates**: Updated extension icons and media files

### **Documentation Updates**
- **Version Bump**: Updated all documentation to version 1.0.5
- **Maintenance**: General maintenance and cleanup updates

---

## 🔧 New in v1.0.4

### **Logo and Visual Updates**
- **New Logo Design**: Fresh, modern logo design for better brand recognition
- **Visual Refresh**: Enhanced visual identity and branding
- **Asset Updates**: Updated extension icons and media files

### **Documentation Updates**
- **Version Bump**: Updated all documentation to version 1.0.4
- **Maintenance**: General maintenance and cleanup updates

---

## 🔧 New in v1.0.3

### **Command Registration Improvements**
- Fixed duplicate command registration conflicts
- Improved controller initialization order
- Better error handling during startup

### **ADB Integration**
- Automatic ADB availability detection
- Smart fallbacks when ADB is not available
- Helpful installation guidance for users

### **Device Management**
- Real device detection (no more fake devices)
- Actual `adb devices` output parsing
- Real-time device status updates

### **Error Handling**
- Comprehensive error recovery
- User-friendly error messages
- Step-by-step troubleshooting guides

---

*This guide makes it easy to maintain and extend the Flutter Fly extension with new commands! 🚀*

*Updated for version 1.0.5 with logo updates and latest improvements.*
