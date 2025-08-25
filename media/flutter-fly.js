// Flutter Fly Webview JavaScript
class FlutterFlyWebview {
    constructor() {
        this.initializeEventListeners();
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

        // Quick action buttons - only essential commands
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
        console.log('Executing Flutter command:', commandId);
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
