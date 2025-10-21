// Flutter Fly Webview JavaScript
console.log('🔄 Flutter Fly JS loading...');

class FlutterFlyWebview {
    constructor() {
        console.log('🔄 Flutter Fly Webview constructor called');
        this.isExecuting = false; // Prevent duplicate execution
        this.initializeEventListeners();
        this.initializeToast();
        console.log('✅ Flutter Fly Webview initialized');
    }

    initializeEventListeners() {
        console.log('🔄 Initializing event listeners...');
        
        try {
            // Connect device button
            const connectBtn = document.getElementById('connectBtn');
            if (connectBtn) {
                console.log('✅ Found connectBtn element');
                connectBtn.addEventListener('click', () => {
                    console.log('🔄 Connect button clicked');
                    if (!this.isExecuting) {
                        this.connectDevice();
                    }
                });
            } else {
                console.error('❌ connectBtn element not found!');
            }
    
            // Refresh devices button
            const refreshBtn = document.getElementById('refreshDevicesBtn');
            if (refreshBtn) {
                console.log('✅ Found refreshDevicesBtn element');
                refreshBtn.addEventListener('click', () => {
                    console.log('🔄 Refresh button clicked');
                    if (!this.isExecuting) {
                        this.refreshDevices();
                    }
                });
            } else {
                console.error('❌ refreshDevicesBtn element not found!');
            }
    
            // Troubleshooting guide button
            const setupGuideBtn = document.querySelector('button[onclick*="showTroubleshootingGuide"]');
            if (setupGuideBtn) {
                console.log('✅ Found setup guide button');
                setupGuideBtn.removeAttribute('onclick');
                setupGuideBtn.addEventListener('click', () => {
                    console.log('🔧 Setup guide button clicked');
                    this.showTroubleshootingGuide();
                });
            }

            // Add click handlers for all command buttons
            const commandButtons = document.querySelectorAll('button[onclick*="flutterFly.executeFlutterCommand"]');
            console.log(`Found ${commandButtons.length} command buttons`);
            
            // Override the onclick handlers to ensure they work
            commandButtons.forEach(button => {
                const onclickAttr = button.getAttribute('onclick');
                if (onclickAttr) {
                    // Extract command ID from the onclick attribute
                    const match = onclickAttr.match(/flutterFly\.executeFlutterCommand\('([^']+)'\)/);
                    if (match && match[1]) {
                        const commandId = match[1];
                        console.log(`Adding event listener for command: ${commandId}`);
                        
                        // Remove the onclick attribute and add an event listener instead
                        button.removeAttribute('onclick');
                        button.addEventListener('click', () => {
                            console.log(`Button clicked for command: ${commandId}`);
                            this.executeFlutterCommand(commandId);
                        });
                    }
                }
            });
    
            // Status message handling
            const clearStatusBtn = document.getElementById('clearStatusBtn');
            if (clearStatusBtn) {
                console.log('✅ Found clearStatusBtn element');
                clearStatusBtn.addEventListener('click', () => {
                    console.log('🔄 Clear status button clicked');
                    this.clearStatusMessages();
                });
            } else {
                console.error('❌ clearStatusBtn element not found!');
            }
    
            // Enter key support for connection form
            const deviceIPInput = document.getElementById('deviceIP');
            if (deviceIPInput) {
                console.log('✅ Found deviceIP element');
                deviceIPInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        console.log('🔄 Enter key pressed in IP field');
                        if (!this.isExecuting) {
                            this.connectDevice();
                        }
                    }
                });
            } else {
                console.error('❌ deviceIP element not found!');
            }
    
            const devicePortInput = document.getElementById('devicePort');
            if (devicePortInput) {
                console.log('✅ Found devicePort element');
                devicePortInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        console.log('🔄 Enter key pressed in port field');
                        if (!this.isExecuting) {
                            this.connectDevice();
                        }
                    }
                });
            } else {
                console.error('❌ devicePort element not found!');
            }
            
            console.log('✅ All event listeners initialized');
        } catch (error) {
            console.error('❌ Error initializing event listeners:', error);
        }
    }

    connectDevice() {
        if (this.isExecuting) {
            console.log('Connection already in progress, skipping');
            return;
        }
        
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

        this.isExecuting = true;

        // Show loading state
        const connectBtn = document.getElementById('connectBtn');
        const originalText = connectBtn.innerHTML;
        connectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
        connectBtn.disabled = true;

        // Send message to extension
        this.sendMessage('connectDevice', { ip, port });

        // Reset button and execution flag after a delay
        setTimeout(() => {
            connectBtn.innerHTML = originalText;
            connectBtn.disabled = false;
            this.isExecuting = false;
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
        if (this.isExecuting) {
            console.log('Command already executing, skipping:', commandId);
            return;
        }
        
        this.isExecuting = true;
        console.log('Executing Flutter command:', commandId);
        
        // Show command execution in UI
        this.addStatusMessage(`⚡ Executing Flutter command: ${commandId}`, 'info');
        
        // Send command to extension
        this.sendMessage('runFlutterCommand', { commandId });
        
        // Find all buttons that match this command
        // First try buttons with data-command attribute
        let buttons = Array.from(document.querySelectorAll(`button[data-command="${commandId}"]`));
        
        // If no buttons found, try with the old onclick method
        if (buttons.length === 0) {
            buttons = Array.from(document.querySelectorAll('button')).filter(btn => {
                const onclick = btn.getAttribute('onclick');
                return onclick && onclick.includes(`executeFlutterCommand('${commandId}')`);
            });
        }
        
        console.log(`Found ${buttons.length} buttons for command: ${commandId}`);
        
        // Show visual feedback for buttons
        buttons.forEach(button => {
            const originalText = button.innerHTML;
            button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${button.innerText}`;
            button.disabled = true;
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 3000);
        });
        
        // Reset execution flag after a delay
        setTimeout(() => {
            this.isExecuting = false;
        }, 3000);
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
            this.addStatusMessage(`Disconnecting device: ${deviceId}`, 'info');
        }
    }

    showTroubleshootingGuide() {
        console.log('🔧 Showing troubleshooting guide');
        this.sendMessage('showTroubleshootingGuide', {});
        this.addStatusMessage('Opening device setup guide...', 'info');
    }

    // Status message functionality
    addStatusMessage(message, type = 'info') {
        const statusContainer = document.getElementById('statusMessages');
        const timestamp = new Date().toLocaleTimeString();
        const typeIcon = {
            'info': 'fas fa-info-circle text-info',
            'success': 'fas fa-check-circle text-success',
            'warning': 'fas fa-exclamation-triangle text-warning',
            'error': 'fas fa-times-circle text-danger'
        };

        const statusLine = document.createElement('div');
        statusLine.className = 'mb-2 p-2 border-start border-3';
        statusLine.style.borderLeftColor = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8';
        statusLine.innerHTML = `
            <small class="text-muted">[${timestamp}]</small>
            <i class="${typeIcon[type] || typeIcon.info} me-2"></i>
            <span class="${type === 'error' ? 'text-danger' : type === 'warning' ? 'text-warning' : type === 'success' ? 'text-success' : ''}">${message}</span>
        `;

        // Remove the placeholder message if it exists
        const placeholder = statusContainer.querySelector('.text-muted.text-center');
        if (placeholder) {
            placeholder.remove();
        }

        statusContainer.appendChild(statusLine);
        statusContainer.scrollTop = statusContainer.scrollHeight;

        // Auto-clear old messages if too many
        if (statusContainer.children.length > 20) {
            statusContainer.removeChild(statusContainer.firstChild);
        }
    }

    clearStatusMessages() {
        const statusContainer = document.getElementById('statusMessages');
        statusContainer.innerHTML = `
            <div class="text-muted text-center py-3">
                <i class="fas fa-bell fa-2x mb-2"></i>
                <p>Status messages cleared</p>
            </div>
        `;
    }

    sendMessage(command, data) {
        console.log(`🔄 Sending message to extension: ${command}`, data);
        
        // This will be handled by the VSCode extension
        try {
            if (window.vscode) {
                console.log('✅ window.vscode is available, sending message');
                window.vscode.postMessage({
                    command: command,
                    ...data
                });
                console.log('✅ Message sent successfully');
            } else {
                console.error('❌ window.vscode is not available!');
                // Fallback for testing
                console.log('VSCode message (FALLBACK):', { command, ...data });
                
                // Show a message in the UI that we're in fallback mode
                this.addStatusMessage('⚠️ Running in fallback mode - VSCode API not available', 'warning');
            }
        } catch (error) {
            console.error('❌ Error sending message to extension:', error);
            this.addStatusMessage(`❌ Failed to send message: ${error.message}`, 'error');
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
        console.log('📨 Received message from extension:', message);
        
        try {
            switch (message.command) {
                case 'updateDevices':
                    console.log('🔄 Updating device list with', message.devices?.length || 0, 'devices');
                    this.updateDevicesList(message.devices);
                    break;
                case 'addStatusMessage':
                    console.log('📝 Adding status message:', message.message);
                    this.addStatusMessage(message.message, message.type);
                    break;
                case 'showToast':
                    console.log('🍞 Showing toast:', message.message);
                    this.showToast(message.message, message.type);
                    break;
                default:
                    console.warn('⚠️ Unknown message command:', message.command);
                    break;
            }
        } catch (error) {
            console.error('❌ Error handling message from extension:', error);
            this.addStatusMessage(`❌ Error handling message: ${error.message}`, 'error');
        }
    }
}

// Initialize the webview
const flutterFly = new FlutterFlyWebview();

// Listen for messages from the extension
window.addEventListener('message', event => {
    flutterFly.handleMessage(event.data);
});

// Add some sample status messages on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        flutterFly.addStatusMessage('Flutter Fly webview loaded successfully!', 'success');
        flutterFly.addStatusMessage('Ready to connect devices and run Flutter commands', 'info');
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
    
    // Ctrl/Cmd + L removed - terminal functionality removed
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
