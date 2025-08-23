# 🧪 Flutter Fly Extension Testing Guide

## 🎯 Overview

This guide will help you test the **Flutter Fly** extension in a new VSCode window to ensure everything works correctly. The extension provides comprehensive Flutter development capabilities including wireless device connection, APK/AAB building, and full Flutter workflow management.

---

## 🚀 Quick Test Setup

### 1. **Compile the Extension**
```bash
npm run compile
```

### 2. **Launch Extension Development Host**
- **Press F5** in VSCode, OR
- Go to **Run and Debug** panel (Ctrl+Shift+D)
- Select **"Run Extension"** configuration
- Click the **Play button**

### 3. **New VSCode Window Opens**
A new VSCode window will open with your extension loaded. This is called the **"Extension Development Host"**.

---

## ✅ Testing Checklist

### **Phase 1: Extension Activation**
- [ ] Extension loads without errors
- [ ] Welcome message appears: "🚀 Flutter Fly is now active! Your ultimate Flutter development companion."
- [ ] No error messages in Output panel
- [ ] Welcome message shows "View Commands" and "Get Started" options

### **Phase 2: Command Discovery**
- [ ] Open Command Palette (Ctrl+Shift+P)
- [ ] Type "Flutter Fly" to see all commands
- [ ] Verify all 30+ commands are visible and properly categorized
- [ ] Check command categories: Project Setup, Building, Running, Device Management, etc.

### **Phase 3: Basic Flutter Functionality**
- [ ] Test "Run Flutter Doctor" command
- [ ] Test "Get Packages" command
- [ ] Test "Upgrade Flutter SDK" command (with confirmation)
- [ ] Test "Format Code" command
- [ ] Test "Analyze Project" command

### **Phase 4: Building Commands**
- [ ] Test "Build APK" command with mode selection
- [ ] Test "Build App Bundle (AAB)" command with mode selection
- [ ] Test "Build iOS" command (iOS folder check)
- [ ] Test "Build Web" command (web folder check)

### **Phase 5: Running Commands**
- [ ] Test "Run on Connected Device" command
- [ ] Test "Run in Debug Mode" command
- [ ] Test "Run in Profile Mode" command
- [ ] Test "Run in Release Mode" command
- [ ] Test "Stop Running App" command

### **Phase 6: Hot Reload Features**
- [ ] Test "Hot Reload" command
- [ ] Test "Hot Restart" command

### **Phase 7: Device Management**
- [ ] Test "Connect Android Device" command
- [ ] Test "Open Android Emulator" command
- [ ] Test "Open iOS Simulator" command (macOS only)
- [ ] Test "Clean Project" command (with confirmation)

### **Phase 8: ADB Functionality (Legacy Features)**
- [ ] Test "Setup custom ADB location" command
- [ ] Test "Remove custom ADB location" command
- [ ] Test "Kill ADB server" command
- [ ] Test "Connect to device IP" command
- [ ] Test "Install APK file" command

### **Phase 9: Firebase Integration**
- [ ] Test "Enable Firebase events debug mode" command
- [ ] Test "Disable Firebase events debug mode" command

---

## 🔧 Testing Commands

### **Command 1: Run Flutter Doctor**
```
Flutter Fly:🚀 Run Flutter Doctor
```
**Expected Behavior:**
- Progress notification appears
- Terminal opens with "Flutter Doctor" title
- `flutter doctor` command executes
- Success message: "✅ Flutter Doctor completed! Check terminal for results."

### **Command 2: Build APK**
```
Flutter Fly:🚀 Build APK
```
**Expected Behavior:**
- Build mode selection appears (debug/profile/release)
- Progress notification shows selected mode
- Terminal opens with "Flutter Build APK" title
- `flutter build apk --[mode]` command executes
- Success message: "✅ APK built successfully in [mode] mode!"

### **Command 3: Run on Connected Device**
```
Flutter Fly:🚀 Run on Connected Device
```
**Expected Behavior:**
- Progress notification appears
- Terminal opens with "Flutter Run" title
- `flutter run` command executes
- Success message: "🚀 Flutter app is running! Use Hot Reload (R) or Hot Restart (Shift+R)"

### **Command 4: Connect Android Device**
```
Flutter Fly:🚀 Connect Android Device
```
**Expected Behavior:**
- Triggers the existing ADB connection command
- IP address input appears
- Port input appears
- Connection attempt is made

---

## 🐛 Troubleshooting Common Issues

### **Issue: Extension Not Loading**
**Symptoms:**
- No welcome message
- Commands not visible
- Error in Output panel

**Solutions:**
1. Check Output panel for errors
2. Restart VSCode
3. Verify TypeScript compilation succeeded
4. Check extension host logs

### **Issue: Flutter Commands Not Working**
**Symptoms:**
- Commands visible but don't execute
- No response when clicked
- Terminal not opening

**Solutions:**
1. Check if Flutter is installed and in PATH
2. Verify Flutter SDK version compatibility
3. Check Output panel for errors
4. Restart extension development host

### **Issue: Device Connection Fails**
**Symptoms:**
- Connection timeout
- "Connection refused" error
- Device not found

**Solutions:**
1. Verify WiFi debugging is enabled on device
2. Check device and computer are on same network
3. Verify device IP address is correct
4. Try resetting device port

### **Issue: Build Commands Fail**
**Symptoms:**
- Build mode selection not working
- Terminal commands not executing
- Build errors

**Solutions:**
1. Ensure Flutter project is open
2. Check Flutter installation
3. Verify project structure
4. Check terminal output for errors

---

## 📱 Android Device Setup for Testing

### **Enable Developer Options**
1. Go to `Settings` → `About Phone`
2. Tap `Build Number` 7 times
3. Go back to `Settings` → `Developer Options`

### **Enable WiFi Debugging**
1. Turn on `Developer Options`
2. Enable `USB Debugging`
3. Enable `Wireless Debugging`
4. Note your device's IP address

### **Connect Device**
1. Use "Connect Android Device" command
2. Enter device IP address
3. Enter port (default: 5555)
4. Allow connection on device

---

## 🧪 Running Tests

### **Unit Tests**
```bash
npm test
```

### **Watch Mode (Development)**
```bash
npm run test:watch
```

### **Coverage Report**
```bash
npm run test -- --coverage
```

---

## 📊 Expected Test Results

### **Test Coverage Target**
- **Statements:** > 69%
- **Branches:** > 54%
- **Functions:** > 69%
- **Lines:** > 68%

### **All Tests Should Pass**
- 7 test suites
- 16 individual tests
- No failures or errors

---

## 🎯 Performance Testing

### **Extension Load Time**
- Extension should activate within 2 seconds
- No noticeable lag in VSCode startup

### **Command Response Time**
- Commands should respond within 500ms
- Progress notifications should appear immediately
- Terminal should open instantly

### **Memory Usage**
- Extension should not cause memory leaks
- Memory usage should remain stable during use

---

## 🔍 Debug Information

### **Output Panel**
- Check "Flutter Fly" output channel
- Look for error messages
- Verify command execution logs

### **Developer Console**
- Press F12 in extension development host
- Check for JavaScript errors
- Monitor network requests

### **Extension Host Logs**
- View extension host logs in Output panel
- Check for TypeScript compilation errors
- Monitor extension lifecycle events

---

## ✅ Success Criteria

### **Extension is Working Correctly When:**
1. ✅ All commands are visible and accessible
2. ✅ No error messages in Output panel
3. ✅ Welcome message appears on activation
4. ✅ Commands execute without errors
5. ✅ Progress notifications work properly
6. ✅ Terminal commands execute correctly
7. ✅ Device connection succeeds (with valid device)
8. ✅ Flutter commands work as expected
9. ✅ All tests pass
10. ✅ No performance issues
11. ✅ Extension deactivates cleanly

---

## 🚀 Next Steps After Testing

### **If All Tests Pass:**
1. ✅ Extension is ready for use
2. ✅ Can be packaged for distribution
3. ✅ Ready for user testing
4. ✅ Ready for marketplace publication

### **If Issues Found:**
1. 🔧 Fix identified problems
2. 🧪 Re-run tests
3. 🔍 Debug remaining issues
4. ✅ Verify fixes work

---

## 📞 Getting Help

### **Common Resources:**
- **VSCode Extension API:** https://code.visualstudio.com/api
- **Flutter Documentation:** https://flutter.dev/docs
- **ADB Documentation:** https://developer.android.com/studio/command-line/adb

### **Extension Issues:**
- Check Output panel for errors
- Review extension host logs
- Verify TypeScript compilation
- Test in clean VSCode instance

---

## 🎉 What's New in Flutter Fly 1.0.0

### **Complete Transformation**
- **Rebranded** from "Wireless ADB" to "Flutter Fly"
- **New Publisher** - jamalihassan0307
- **Comprehensive Features** - 30+ Flutter development commands
- **Beautiful UI** - Modern, attractive interface

### **New Flutter Features**
- **Project Setup** - Flutter Doctor, SDK upgrade, package management
- **Building** - APK, AAB, iOS, and Web builds
- **Running** - Multiple run modes and debugging
- **Device Management** - Emulator and simulator support
- **Code Quality** - Formatting, analysis, and cleanup

### **Enhanced User Experience**
- **Progress Indicators** - Beautiful progress notifications
- **Command Categories** - Organized command structure
- **Interactive Prompts** - User-friendly confirmations
- **Comprehensive Feedback** - Clear success and error messages

---

*Happy Testing! 🎉*

*This guide ensures your Flutter Fly extension works perfectly for Flutter developers worldwide.*

*Transformed from Wireless ADB to Flutter Fly by Jam Ali Hassan*
