// Flutter Fly Webview JavaScript
class FlutterFlyWebview {
    constructor() {
        this.initializeEventListeners();
        this.populateFlutterCommands();
        this.initializeToast();
    }

    initializeEventListeners() {
        // Connect device button
        document.getElementById('connectBtn').addEventListener('click', () => {
            this.connectDevice();
        });

        // Refresh devices button
        document.getElementById('refreshDevicesBtn').addEventListener('click', () => {
            this.refreshDevices();
        });

        // Quick action buttons
        document.getElementById('flutterDoctorBtn').addEventListener('click', () => {
            this.executeFlutterCommand('runFlutterDoctor');
        });

        document.getElementById('getPackagesBtn').addEventListener('click', () => {
            this.executeFlutterCommand('getPackages');
        });

        document.getElementById('upgradePackagesBtn').addEventListener('click', () => {
            this.executeFlutterCommand('upgradePackages');
        });

        document.getElementById('cleanProjectBtn').addEventListener('click', () => {
            this.executeFlutterCommand('cleanProject');
        });

        document.getElementById('analyzeProjectBtn').addEventListener('click', () => {
            this.executeFlutterCommand('analyzeProject');
        });

        document.getElementById('formatCodeBtn').addEventListener('click', () => {
            this.executeFlutterCommand('formatCode');
        });

        // Clear terminal button
        document.getElementById('clearTerminalBtn').addEventListener('click', () => {
            this.clearTerminal();
        });

        // Enter key support for connection form
        document.getElementById('deviceIP').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.connectDevice();
            }
        });

        document.getElementById('devicePort').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.connectDevice();
            }
        });
    }

    populateFlutterCommands() {
        const commandsGrid = document.getElementById('flutterCommandsGrid');
        const commands = [
            {
                id: 'flutterDoctor',
                name: 'Flutter Doctor',
                description: 'Check Flutter installation and dependencies',
                category: 'Health Check',
                icon: 'fas fa-stethoscope'
            },
            {
                id: 'getPackages',
                name: 'Get Packages',
                description: 'Download and update Flutter packages',
                category: 'Dependencies',
                icon: 'fas fa-download'
            },
            {
                id: 'runApp',
                name: 'Run App',
                description: 'Run Flutter app on connected device',
                category: 'Development',
                icon: 'fas fa-play-circle'
            },
            {
                id: 'buildAPK',
                name: 'Build APK',
                description: 'Build Android APK file',
                category: 'Building',
                icon: 'fas fa-mobile-alt'
            },
            {
                id: 'buildAAB',
                name: 'Build AAB',
                description: 'Build Android App Bundle',
                category: 'Building',
                icon: 'fas fa-box'
            },
            {
                id: 'hotReload',
                name: 'Hot Reload',
                description: 'Hot reload the running app',
                category: 'Development',
                icon: 'fas fa-sync-alt'
            },
            {
                id: 'hotRestart',
                name: 'Hot Restart',
                description: 'Hot restart the running app',
                category: 'Development',
                icon: 'fas fa-redo'
            },
            {
                id: 'stopApp',
                name: 'Stop App',
                description: 'Stop the running Flutter app',
                category: 'Development',
                icon: 'fas fa-stop'
            },
            {
                id: 'cleanProject',
                name: 'Clean Project',
                description: 'Clean Flutter project build files',
                category: 'Maintenance',
                icon: 'fas fa-broom'
            },
            {
                id: 'analyzeProject',
                name: 'Analyze Project',
                description: 'Analyze Flutter project for issues',
                category: 'Quality',
                icon: 'fas fa-search'
            }
        ];

        commands.forEach(command => {
            const commandCard = this.createCommandCard(command);
            commandsGrid.appendChild(commandCard);
        });
    }

    createCommandCard(command) {
        const card = document.createElement('div');
        card.className = 'command-card';
        card.innerHTML = `
            <div class="d-flex align-items-start">
                <div class="flex-grow-1">
                    <h6><i class="${command.icon} me-2"></i>${command.name}</h6>
                    <p class="mb-2">${command.description}</p>
                    <span class="command-category">${command.category}</span>
                </div>
                <button class="btn btn-sm btn-outline-primary ms-2" onclick="flutterFly.executeFlutterCommand('${command.id}')">
                    <i class="fas fa-play"></i>
                </button>
            </div>
        `;
        return card;
    }

    connectDevice() {
        const ip = document.getElementById('deviceIP').value.trim();
        const port = document.getElementById('devicePort').value.trim();

        if (!ip || !port) {
            this.showToast('Please enter both IP address and port', 'error');
            return;
        }

        if (!this.isValidIP(ip)) {
            this.showToast('Please enter a valid IP address', 'error');
            return;
        }

        if (!this.isValidPort(port)) {
            this.showToast('Please enter a valid port number (1-65535)', 'error');
            return;
        }

        // Show loading state
        const connectBtn = document.getElementById('connectBtn');
        const originalText = connectBtn.innerHTML;
        connectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
        connectBtn.disabled = true;

        // Send message to extension
        this.sendMessage('connectDevice', { ip, port });

        // Reset button after a delay
        setTimeout(() => {
            connectBtn.innerHTML = originalText;
            connectBtn.disabled = false;
        }, 3000);
    }

    isValidIP(ip) {
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(ip);
    }

    isValidPort(port) {
        const portNum = parseInt(port);
        return portNum >= 1 && portNum <= 65535;
    }

    refreshDevices() {
        const refreshBtn = document.getElementById('refreshDevicesBtn');
        const originalText = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        refreshBtn.disabled = true;

        this.sendMessage('refreshDevices', {});

        setTimeout(() => {
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
        }, 2000);
    }

    executeFlutterCommand(commandId) {
        this.sendMessage('runFlutterCommand', { commandId });
        this.addTerminalOutput(`Executing Flutter command: ${commandId}`, 'info');
    }

    updateDevicesList(devices) {
        const devicesList = document.getElementById('devicesList');
        
        if (!devices || devices.length === 0) {
            devicesList.innerHTML = `
                <div class="text-muted text-center py-3">
                    <i class="fas fa-mobile-alt fa-2x mb-2"></i>
                    <p>No devices connected</p>
                </div>
            `;
            return;
        }

        devicesList.innerHTML = devices.map(device => `
            <div class="device-item ${device.status}">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="device-info">
                        <h6>${device.name}</h6>
                        <small class="text-muted">${device.id}</small>
                    </div>
                    <div class="d-flex align-items-center">
                        <span class="device-status ${device.status} me-2">
                            ${device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                        </span>
                        <button class="btn btn-sm btn-outline-danger" onclick="flutterFly.disconnectDevice('${device.id}')">
                            <i class="fas fa-unlink"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    disconnectDevice(deviceId) {
        if (confirm(`Are you sure you want to disconnect ${deviceId}?`)) {
            this.sendMessage('disconnectDevice', { deviceId });
            this.addTerminalOutput(`Disconnecting device: ${deviceId}`, 'info');
        }
    }

    addTerminalOutput(message, type = 'info') {
        const terminal = document.getElementById('terminalOutput');
        const timestamp = new Date().toLocaleTimeString();
        const typeIcon = {
            'info': 'fas fa-info-circle text-info',
            'success': 'fas fa-check-circle text-success',
            'warning': 'fas fa-exclamation-triangle text-warning',
            'error': 'fas fa-times-circle text-danger'
        };

        const outputLine = document.createElement('div');
        outputLine.className = 'mb-2';
        outputLine.innerHTML = `
            <span class="text-muted">[${timestamp}]</span>
            <i class="${typeIcon[type] || typeIcon.info} me-2"></i>
            <span class="${type === 'error' ? 'text-danger' : type === 'warning' ? 'text-warning' : type === 'success' ? 'text-success' : ''}">${message}</span>
        `;

        terminal.appendChild(outputLine);
        terminal.scrollTop = terminal.scrollHeight;

        // Auto-clear old messages if too many
        if (terminal.children.length > 50) {
            terminal.removeChild(terminal.firstChild);
        }
    }

    clearTerminal() {
        const terminal = document.getElementById('terminalOutput');
        terminal.innerHTML = `
            <div class="text-muted text-center py-3">
                <i class="fas fa-terminal fa-2x mb-2"></i>
                <p>Terminal cleared</p>
            </div>
        `;
    }

    sendMessage(command, data) {
        // This will be handled by the VSCode extension
        if (window.vscode) {
            window.vscode.postMessage({
                command: command,
                ...data
            });
        } else {
            // Fallback for testing
            console.log('VSCode message:', { command, ...data });
        }
    }

    initializeToast() {
        // Initialize Bootstrap toasts
        const toastElList = [].slice.call(document.querySelectorAll('.toast'));
        toastElList.map(function (toastEl) {
            return new bootstrap.Toast(toastEl);
        });
    }

    showToast(message, type = 'success') {
        const toastId = type === 'success' ? 'successToast' : 'errorToast';
        const toastBodyId = type === 'success' ? 'successToastBody' : 'errorToastBody';
        
        document.getElementById(toastBodyId).textContent = message;
        const toast = new bootstrap.Toast(document.getElementById(toastId));
        toast.show();
    }

    // Handle messages from the extension
    handleMessage(message) {
        switch (message.command) {
            case 'updateDevices':
                this.updateDevicesList(message.devices);
                break;
            case 'terminalOutput':
                this.addTerminalOutput(message.text, message.type);
                break;
            case 'showToast':
                this.showToast(message.message, message.type);
                break;
        }
    }
}

// Initialize the webview
const flutterFly = new FlutterFlyWebview();

// Listen for messages from the extension
window.addEventListener('message', event => {
    flutterFly.handleMessage(event.data);
});

// Add some sample terminal output on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        flutterFly.addTerminalOutput('Flutter Fly webview loaded successfully!', 'success');
        flutterFly.addTerminalOutput('Ready to connect devices and run Flutter commands', 'info');
    }, 1000);
});

// Handle window focus to refresh devices
window.addEventListener('focus', () => {
    // Refresh devices when window gains focus
    setTimeout(() => {
        flutterFly.refreshDevices();
    }, 500);
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to connect device
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        flutterFly.connectDevice();
    }
    
    // Ctrl/Cmd + R to refresh devices
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        flutterFly.refreshDevices();
    }
    
    // Ctrl/Cmd + L to clear terminal
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        flutterFly.clearTerminal();
    }
});

// Add some visual feedback for interactions
document.addEventListener('click', (e) => {
    if (e.target.closest('.command-card')) {
        e.target.closest('.command-card').style.transform = 'scale(0.98)';
        setTimeout(() => {
            e.target.closest('.command-card').style.transform = '';
        }, 150);
    }
});

// Add hover effects for better UX
document.addEventListener('mouseover', (e) => {
    if (e.target.closest('.device-item')) {
        e.target.closest('.device-item').style.transform = 'translateX(5px)';
    }
});

document.addEventListener('mouseout', (e) => {
    if (e.target.closest('.device-item')) {
        e.target.closest('.device-item').style.transform = '';
    }
});
