# Contributing to Flutter Fly

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

-   Reporting a bug
-   Discussing the current state of the code
-   Submitting a fix
-   Proposing new features
-   Becoming a maintainer

## We Develop with Github

We use github to host code, to track issues and feature requests, as well as accept pull requests.

## We Use [Github Flow](https://guides.github.com/introduction/flow/index.html) with Some Changes, So All Code Changes Happen Through Pull Requests

Pull requests are the best way to propose changes to the codebase (we use [Github Flow](https://guides.github.com/introduction/flow/index.html)). We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. Write clear meaningful git commit messages (try use commintlint rules).
3. Always create PR to `main` branch.
4. Make sure your code lints.
5. Issue that pull request!

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](https://github.com/jamalihassan0307/flutter-fly/blob/main/LICENSE) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using Github's [issues](https://github.com/jamalihassan0307/flutter-fly/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/jamalihassan0307/flutter-fly/issues/new); it's that easy!

## License

By contributing, you agree that your contributions will be licensed under its [MIT License](https://github.com/jamalihassan0307/flutter-fly/blob/main/LICENSE).

---

## 🚀 About Flutter Fly

**Flutter Fly** is the ultimate Flutter development companion for VSCode, transformed from the original "Wireless ADB" extension. It provides comprehensive Flutter development capabilities including:

- **Flutter Development Workflow** - Doctor, SDK management, package management
- **Building & Compiling** - APK, AAB, iOS, and Web builds
- **Running & Debugging** - Multiple run modes and device management
- **Wireless Connectivity** - WiFi debugging and device management
- **Code Quality** - Formatting, analysis, and cleanup tools

## 🎯 Development Focus

When contributing to Flutter Fly, please focus on:

1. **Flutter Development Experience** - Enhancing Flutter workflow
2. **User Experience** - Making commands intuitive and beautiful
3. **Performance** - Ensuring fast and responsive operation
4. **Cross-Platform Support** - Maintaining Windows, macOS, and Linux compatibility
5. **Device Management** - Improving wireless connectivity and device handling

## 🔧 Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jamalihassan0307/flutter-fly.git
   cd flutter-fly
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Compile the extension:**
   ```bash
   npm run compile
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

5. **Watch for changes:**
   ```bash
   npm run watch
   ```

## 🧪 Testing Your Changes

1. **Compile the extension:**
   ```bash
   npm run compile
   ```

2. **Press F5 in VSCode** to launch the extension development host

3. **Test your changes** in the new VSCode window

4. **Run tests** to ensure nothing is broken:
   ```bash
   npm test
   ```

## 📝 Commit Guidelines

We use conventional commits with emojis. Use the commitizen tool:

```bash
npm run cm
```

Or manually follow this format:
- ✨ `feat:` New features
- 🐛 `fix:` Bug fixes
- 📝 `docs:` Documentation updates
- 🧪 `test:` Test improvements
- 🔧 `chore:` Maintenance tasks
- ♻️ `refactor:` Code refactoring
- 🎨 `style:` Code style changes

## 🚀 Publishing

When ready to publish:

1. **Update version** in package.json
2. **Update CHANGELOG.md** with new features
3. **Run tests** to ensure everything works
4. **Package the extension:**
   ```bash
   npm run vscode:prepublish
   ```

---

*Thank you for contributing to Flutter Fly! 🚀*

*Transformed from Wireless ADB to Flutter Fly by Jam Ali Hassan*
