# 🚀 Flutter Fly Extension - Build & Publish Guide

## 🎯 Overview

This guide will help you build and publish the **Flutter Fly** extension to the VSCode Marketplace. The extension is now ready for distribution with comprehensive Flutter development features.

---

## 🛠️ Build Commands

### **Basic Build Commands**

#### **1. Clean Build**
```bash
npm run build
```
**What it does:**
- Cleans the `out` and `dist` directories
- Compiles TypeScript code
- Packages the extension into a `.vsix` file
- Creates `flutter-fly-1.0.0.vsix`

#### **2. Clean Only**
```bash
npm run clean
```
**What it does:**
- Removes `out` and `dist` directories
- Prepares for fresh compilation

#### **3. Compile Only**
```bash
npm run compile
```
**What it does:**
- Compiles TypeScript to JavaScript
- Outputs to `out/` directory

#### **4. Package Only**
```bash
npm run package
```
**What it does:**
- Runs prepublish scripts
- Creates the VSIX package
- Includes all necessary files

---

## 📦 Advanced Build Commands

### **Version-Specific Packaging**

#### **Patch Version (Bug Fixes)**
```bash
npm run package:patch
```
**What it does:**
- Increments patch version (1.0.0 → 1.0.1)
- Creates package with new version
- Updates package.json automatically

#### **Minor Version (New Features)**
```bash
npm run package:minor
```
**What it does:**
- Increments minor version (1.0.0 → 1.1.0)
- Creates package with new version
- Updates package.json automatically

#### **Major Version (Breaking Changes)**
```bash
npm run package:major
```
**What it does:**
- Increments major version (1.0.0 → 2.0.0)
- Creates package with new version
- Updates package.json automatically

---

## 🚀 Publish Commands

### **Basic Publishing**

#### **1. Publish Current Version**
```bash
npm run publish
```
**What it does:**
- Builds the extension
- Publishes to VSCode Marketplace
- Uses current version number

#### **2. Dry Run Publishing**
```bash
npm run publish:dry
```
**What it does:**
- Builds the extension
- Simulates publishing process
- No actual publishing occurs
- Great for testing before real publish

### **Version-Specific Publishing**

#### **1. Publish Patch Version**
```bash
npm run publish:patch
```
**What it does:**
- Increments patch version
- Builds and packages
- Publishes to marketplace

#### **2. Publish Minor Version**
```bash
npm run publish:minor
```
**What it does:**
- Increments minor version
- Builds and packages
- Publishes to marketplace

#### **3. Publish Major Version**
```bash
npm run publish:major
```
**What it does:**
- Increments major version
- Builds and packages
- Publishes to marketplace

---

## 🔄 Release Commands

### **Complete Release Workflow**

#### **1. Full Release**
```bash
npm run release
```
**What it does:**
- Builds the extension
- Publishes to marketplace
- Complete release workflow

#### **2. Release with Version Bump**
```bash
npm run release:patch    # 1.0.0 → 1.0.1
npm run release:minor    # 1.0.0 → 1.1.0
npm run release:major    # 1.0.0 → 2.0.0
```

---

## 📋 Build Process Details

### **What Gets Included in the VSIX Package**

The build process creates a comprehensive package including:

```
flutter-fly-1.0.0.vsix
├─ [Content_Types].xml
├─ extension.vsixmanifest
└─ extension/
   ├─ Source Code (out/ directory)
   ├─ Documentation (README.md, CHANGELOG.md, etc.)
   ├─ Configuration Files (.eslintrc, jest.config.js, etc.)
   ├─ Media Files (icon.png, etc.)
   ├─ Package Configuration (package.json)
   └─ Build Artifacts
```

### **File Sizes**
- **Total Package:** ~258.33 KB
- **Source Code:** ~99.97 KB
- **Documentation:** ~15.2 KB
- **Media:** ~81.94 KB
- **Configuration:** ~1.92 KB

---

## 🧪 Testing Your Build

### **1. Verify VSIX Creation**
```bash
Get-ChildItem -Filter "*.vsix"
```
**Expected Output:**
```
flutter-fly-1.0.0.vsix (264,528 bytes)
```

### **2. Test Extension Installation**
1. **Open VSCode**
2. **Go to Extensions** (Ctrl+Shift+X)
3. **Click "..." (More Actions)**
4. **Select "Install from VSIX..."**
5. **Choose your .vsix file**
6. **Verify extension loads correctly**

### **3. Test All Commands**
Use the [TESTING_GUIDE.md](TESTING_GUIDE.md) to verify all functionality works correctly.

---

## 🚀 Publishing to Marketplace

### **Prerequisites**
1. **VSCode Publisher Account** - Create at https://marketplace.visualstudio.com/
2. **Personal Access Token** - Generate in your publisher account
3. **Extension ID** - Your unique extension identifier

### **Publishing Steps**

#### **1. Set Environment Variable**
```bash
# Windows PowerShell
$env:VSCE_DEPLOY_TOKEN="your_personal_access_token_here"

# Windows Command Prompt
set VSCE_DEPLOY_TOKEN=your_personal_access_token_here

# macOS/Linux
export VSCE_DEPLOY_TOKEN="your_personal_access_token_here"
```

#### **2. Publish the Extension**
```bash
npm run publish
```

#### **3. Verify Publication**
- Check the [VSCode Marketplace](https://marketplace.visualstudio.com/)
- Search for "Flutter Fly"
- Verify your extension appears

---

## 🔧 Troubleshooting

### **Common Build Issues**

#### **Issue: TypeScript Compilation Errors**
**Symptoms:**
- Build fails during compilation
- TypeScript errors in output

**Solutions:**
1. Fix TypeScript errors in source code
2. Check `tsconfig.json` configuration
3. Verify all imports are correct
4. Run `npm run compile` separately to see specific errors

#### **Issue: Missing Dependencies**
**Symptoms:**
- Build fails with missing package errors
- VSCE cannot find required packages

**Solutions:**
1. Run `npm install` to install dependencies
2. Check `package.json` for missing devDependencies
3. Install missing packages manually

#### **Issue: Version Compatibility**
**Symptoms:**
- VSCE complains about version mismatches
- Engine version conflicts

**Solutions:**
1. Update `engines.vscode` in package.json
2. Update `@types/vscode` version
3. Ensure compatibility between versions

### **Common Publish Issues**

#### **Issue: Authentication Failed**
**Symptoms:**
- Publishing fails with auth errors
- Token not recognized

**Solutions:**
1. Verify `VSCE_DEPLOY_TOKEN` is set correctly
2. Check token hasn't expired
3. Ensure token has publish permissions

#### **Issue: Extension Already Exists**
**Symptoms:**
- Publishing fails with duplicate extension error

**Solutions:**
1. Update version number in package.json
2. Use `npm run publish:patch` for automatic version bump
3. Ensure unique extension identifier

---

## 📊 Build Statistics

### **Current Build Metrics**
- **Build Time:** ~30-60 seconds
- **Package Size:** ~258.33 KB
- **Files Included:** 158 files
- **Dependencies:** 1553 packages
- **Test Coverage:** 69.39% statements, 54.79% branches

### **Performance Optimization**
- **Clean Builds:** Faster than incremental
- **Dependency Caching:** npm caches for faster installs
- **TypeScript Compilation:** Optimized with proper tsconfig

---

## 🎯 Best Practices

### **Before Publishing**
1. ✅ **Run all tests:** `npm test`
2. ✅ **Test the build:** `npm run build`
3. ✅ **Test VSIX installation:** Install locally first
4. ✅ **Verify all commands work:** Use testing guide
5. ✅ **Check documentation:** README and CHANGELOG are current

### **Version Management**
1. **Use semantic versioning:** MAJOR.MINOR.PATCH
2. **Patch versions:** Bug fixes and minor improvements
3. **Minor versions:** New features, backward compatible
4. **Major versions:** Breaking changes

### **Quality Assurance**
1. **Test on different platforms:** Windows, macOS, Linux
2. **Verify Flutter compatibility:** Different Flutter versions
3. **Check marketplace guidelines:** Follow VSCode standards
4. **User feedback:** Gather feedback before major releases

---

## 🚀 Quick Start Commands

### **Development Workflow**
```bash
# 1. Make changes to code
# 2. Test changes
npm test

# 3. Build extension
npm run build

# 4. Test VSIX locally
# 5. Publish when ready
npm run publish
```

### **Release Workflow**
```bash
# 1. Prepare for release
npm run build

# 2. Test thoroughly
# 3. Publish with version bump
npm run publish:patch    # or minor/major
```

---

## 📞 Support

### **Build Issues**
- Check this guide for common solutions
- Review error messages carefully
- Verify all dependencies are installed

### **Publishing Issues**
- Check VSCode Marketplace documentation
- Verify publisher account and permissions
- Ensure extension ID is unique

---

## 🎉 Success Checklist

### **Build Success**
- [ ] TypeScript compiles without errors
- [ ] VSIX package is created successfully
- [ ] Package size is reasonable (~258 KB)
- [ ] All files are included correctly

### **Publish Success**
- [ ] Extension appears on marketplace
- [ ] All commands work correctly
- [ ] Documentation is current
- [ ] Version number is correct

---

*Happy Building and Publishing! 🚀*

*This guide ensures your Flutter Fly extension reaches Flutter developers worldwide.*

*Transformed from Wireless ADB to Flutter Fly by Jam Ali Hassan*
