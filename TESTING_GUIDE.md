# 🧪 Wireless ADB Extension Testing Guide

## 🎯 Overview

This guide will help you test the **Wireless ADB** extension in a new VSCode window to ensure everything works correctly. The extension allows you to connect to Android devices wirelessly and manage ADB operations directly from VSCode.

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
- [ ] Welcome message appears: "🚀 Wireless ADB Extension is now active!"
- [ ] No error messages in Output panel

### **Phase 2: Command Discovery**
- [ ] Open Command Palette (Ctrl+Shift+P)
- [ ] Type "Wireless ADB" to see all commands
- [ ] Verify all 9 commands are visible

### **Phase 3: Basic Functionality**
- [ ] Test "Setup custom ADB location" command
- [ ] Test "Remove custom ADB location" command
- [ ] Test "Kill ADB server" command

### **Phase 4: Device Connection (Requires Android Device)**
- [ ] Enable WiFi debugging on Android device
- [ ] Test "Connect to device IP" command
- [ ] Test "Connect to device from List" command
- [ ] Test "Disconnect from any devices" command

### **Phase 5: APK Installation (Requires APK File)**
- [ ] Test "Pick .APK file and install" command
- [ ] Verify file picker opens
- [ ] Test with sample APK file

### **Phase 6: Firebase Integration**
- [ ] Test "Enable Firebase events debug mode" command
- [ ] Test "Disable Firebase events debug mode" command

---

## 🔧 Testing Commands

### **Command 1: Setup Custom ADB Location**
```
Wireless ADB:📱 Setup custom ADB location
```
**Expected Behavior:**
- File picker opens
- Can select ADB executable
- Success message appears

### **Command 2: Connect to Device IP**
```
Wireless ADB:📱 Connect to device IP
```
**Expected Behavior:**
- Input box for IP address appears
- Input box for port appears
- Connection attempt is made
- Success/error message shown

### **Command 3: Install APK File**
```
Wireless ADB:📱 Pick .APK file and install
```
**Expected Behavior:**
- File picker opens
- Can select APK files
- Installation process starts
- Success/error message shown

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

### **Issue: Commands Not Working**
**Symptoms:**
- Commands visible but don't execute
- No response when clicked

**Solutions:**
1. Check if ADB is installed
2. Verify ADB path configuration
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
1. Use "Connect to device IP" command
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
- **Statements:** > 70%
- **Branches:** > 50%
- **Functions:** > 70%
- **Lines:** > 70%

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
- File pickers should open immediately
- Input boxes should appear instantly

### **Memory Usage**
- Extension should not cause memory leaks
- Memory usage should remain stable during use

---

## 🔍 Debug Information

### **Output Panel**
- Check "Wireless ADB" output channel
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
5. ✅ File pickers and input boxes work
6. ✅ Device connection succeeds (with valid device)
7. ✅ APK installation works (with valid APK)
8. ✅ All tests pass
9. ✅ No performance issues
10. ✅ Extension deactivates cleanly

---

## 🚀 Next Steps After Testing

### **If All Tests Pass:**
1. ✅ Extension is ready for use
2. ✅ Can be packaged for distribution
3. ✅ Ready for user testing

### **If Issues Found:**
1. 🔧 Fix identified problems
2. 🧪 Re-run tests
3. 🔍 Debug remaining issues
4. ✅ Verify fixes work

---

## 📞 Getting Help

### **Common Resources:**
- **VSCode Extension API:** https://code.visualstudio.com/api
- **ADB Documentation:** https://developer.android.com/studio/command-line/adb
- **Flutter Documentation:** https://flutter.dev/docs

### **Extension Issues:**
- Check Output panel for errors
- Review extension host logs
- Verify TypeScript compilation
- Test in clean VSCode instance

---

*Happy Testing! 🎉*

*This guide ensures your Wireless ADB extension works perfectly for Flutter developers.*
