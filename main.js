// main.js – Electron main process
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// -----------------------------------------------------------------------------
// Dynamic Import for Electron-Store (ESM-only)
let Store;
let settingsStore;

(async () => {
    try {
        Store = (await import('electron-store')).default;
        settingsStore = new Store({ name: 'settings' });

        // Start the app after settingsStore is ready
        app.whenReady().then(() => {
            createWindow();
        });
    } catch (error) {
        console.error('Failed to initialize settings store:', error);
        app.quit();
    }
})();

// -----------------------------------------------------------------------------
// Global State
let mainWindow = null;
let encryptionKey = null; // Buffer – derived from PIN after successful login
const userDataPath = app.getPath('userData');
const pinConfigPath = path.join(userDataPath, 'pin.json');
const vaultPath = path.join(userDataPath, 'vault.enc');

// -----------------------------------------------------------------------------
// Helper Functions
// Derive a 256-bit key from PIN + salt (PBKDF2-SHA256)
function deriveKey(pin, saltHex) {
    const salt = Buffer.from(saltHex, 'hex');
    return crypto.pbkdf2Sync(pin, salt, 200_000, 32, 'sha256');
}

// Generate a new random salt (16 bytes)
function generateSalt() {
    return crypto.randomBytes(16).toString('hex');
}

// -----------------------------------------------------------------------------
// PIN Handling
function isPinSet() {
    const saltPath = path.join(userDataPath, 'salt');
    return fs.existsSync(pinConfigPath) && fs.existsSync(saltPath);
}

function setPin(pin) {
    const salt = generateSalt();
    const key = deriveKey(pin, salt);
    const config = {
        keyHash: key.toString('hex')
    };

    try {
        fs.writeFileSync(pinConfigPath, JSON.stringify(config, null, 2), { mode: 0o600 });
        fs.writeFileSync(path.join(userDataPath, 'salt'), salt, { mode: 0o600 });
        encryptionKey = key;
    } catch (error) {
        console.error('Error setting PIN:', error);
        throw new Error('Failed to set PIN');
    }
}

function verifyPin(pin) {
    if (!isPinSet()) return false;

    try {
        const raw = fs.readFileSync(pinConfigPath, 'utf8');
        const saltPath = path.join(userDataPath, 'salt');

        // Check if the salt file exists
        if (!fs.existsSync(saltPath)) {
            console.error('Salt file is missing. PIN verification cannot proceed.');
            return false;
        }

        const salt = fs.readFileSync(saltPath, 'utf8');
        const { keyHash } = JSON.parse(raw);
        const derived = deriveKey(pin, salt);
        const isValid = derived.toString('hex') === keyHash;

        if (isValid) encryptionKey = derived;
        return isValid;
    } catch (error) {
        console.error('Error verifying PIN:', error);
        return false;
    }
}

// -----------------------------------------------------------------------------
// Vault Encryption/Decryption (AES-256-GCM)
function encryptVault(plainText, key) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        data: encrypted.toString('hex')
    };
}

function decryptVault(encObj, key) {
    const iv = Buffer.from(encObj.iv, 'hex');
    const tag = Buffer.from(encObj.tag, 'hex');
    const data = Buffer.from(encObj.data, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString('utf8');
}

// -----------------------------------------------------------------------------
// Vault Operations
function readVault() {
    try {
        if (!fs.existsSync(vaultPath)) return [];
        const raw = fs.readFileSync(vaultPath, 'utf8');
        const encObj = JSON.parse(raw);
        const json = decryptVault(encObj, encryptionKey);
        return JSON.parse(json);
    } catch (e) {
        console.error('Error reading vault:', e);
        throw new Error('Failed to read vault');
    }
}

function writeVault(vaultArray) {
    try {
        const plain = JSON.stringify(vaultArray, null, 2);
        const encObj = encryptVault(plain, encryptionKey);
        console.log('Writing updated vault:', vaultArray); // Debugging
        fs.writeFileSync(vaultPath, JSON.stringify(encObj, null, 2), { mode: 0o600 });
    } catch (e) {
        console.error('Error writing vault:', e);
        throw e;
    }
}

function wipeVault() {
    if (fs.existsSync(vaultPath)) fs.unlinkSync(vaultPath);
}

// -----------------------------------------------------------------------------
// Settings (Theme)
function getTheme() {
    return settingsStore?.get('theme', 'light');
}

function setTheme(theme) {
    settingsStore?.set('theme', theme);
}

// -----------------------------------------------------------------------------
// IPC Handlers
ipcMain.handle('pin-is-set', () => isPinSet());

ipcMain.handle('pin-create', async (event, pin) => {
    try {
        setPin(pin);
        return { success: true };
    } catch (e) {
        console.error('PIN create error:', e);
        return { success: false, error: e.message };
    }
});

ipcMain.handle('pin-verify', async (event, pin) => {
    const ok = verifyPin(pin);
    if (!ok) {
        return { success: false, error: 'PIN verification failed. Please ensure your PIN is correct or reset it.' };
    }
    return { success: true };
});

ipcMain.handle('vault-get', async () => {
    if (!encryptionKey) return { success: false, error: 'Vault is locked. Please unlock first.' };
    try {
        const data = readVault();
        return { success: true, vault: data };
    } catch (e) {
        console.error('Vault read error:', e);
        return { success: false, error: e.message };
    }
});

ipcMain.handle('vault-add', async (event, entry) => {
    if (!encryptionKey) return { success: false, error: 'Not unlocked' };
    try {
        const vault = readVault();
        const newEntry = {
            ...entry,
            id: crypto.randomUUID(), // Assign a unique ID to the new entry
        };
        vault.push(newEntry);
        writeVault(vault);
        return { success: true };
    } catch (e) {
        console.error('Vault add error:', e);
        return { success: false, error: e.message };
    }
});

ipcMain.handle('vault-wipe', async () => {
    if (!encryptionKey) return { success: false, error: 'Not unlocked' };
    try {
        wipeVault();
        encryptionKey = null;
        return { success: true };
    } catch (e) {
        console.error('Vault wipe error:', e);
        return { success: false, error: e.message };
    }
});

ipcMain.handle('vault-delete', async (event, id) => {
    if (!encryptionKey) return { success: false, error: 'Vault is locked. Please unlock first.' };
    try {
        const vault = readVault();
        console.log('Current vault:', vault); // Debugging
        console.log('Deleting entry with ID:', id); // Debugging

        const updatedVault = vault.filter(entry => entry.id !== id);
        console.log('Updated vault:', updatedVault); // Debugging

        writeVault(updatedVault);
        return { success: true };
    } catch (e) {
        console.error('Vault delete error:', e);
        return { success: false, error: e.message };
    }
});

ipcMain.handle('generate-password', async (event, opts) => {
    const length = Math.max(4, Math.min(64, opts.length || 16));
    const charset = [
        opts.lowercase ? 'abcdefghijklmnopqrstuvwxyz' : '',
        opts.uppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
        opts.numbers ? '0123456789' : '',
        opts.symbols ? '!@#$%^&*()-_=+[]{}|;:,.<>?/' : ''
    ].join('');
    if (!charset) return { success: false, error: 'No character sets selected' };

    let password = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        const idx = bytes[i] % charset.length;
        password += charset[idx];
    }
    return { success: true, password };
});

ipcMain.handle('theme-get', async () => {
    return { theme: getTheme() };
});

ipcMain.handle('theme-set', async (event, theme) => {
    setTheme(theme);
    return { success: true };
});

// -----------------------------------------------------------------------------
// Create the Main BrowserWindow
function createWindow() {
    if (mainWindow) return; // Prevent creating multiple windows

    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        minWidth: 800,
        minHeight: 600,
        title: 'NestKey',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            enableRemoteModule: false
        },
        icon: path.join(__dirname, 'assets', 'icon.png')
    });

    mainWindow.loadFile(path.join(__dirname, 'app', 'index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// App Lifecycle
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        // On macOS, re-create a window if no windows are open
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    // Quit the app when all windows are closed (except on macOS)
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
