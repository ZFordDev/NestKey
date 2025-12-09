// preload.js – Bridge between renderer and main
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // PIN handling
    isPinSet: () => ipcRenderer.invoke('api-is-pin-set'),
    createPin: (pin) => ipcRenderer.invoke('api-create-pin', pin),
    verifyPin: (pin) => ipcRenderer.invoke('api-verify-pin', pin),

    // Theme
    getTheme: () => ipcRenderer.invoke('api-get-theme'),
    setTheme: (theme) => ipcRenderer.invoke('api-set-theme', theme),

    // Vault CRUD
    getVault: () => ipcRenderer.invoke('api-get-vault'),
    addCredential: (cred) => ipcRenderer.invoke('api-add-credential', cred),
    updateCredential: (id, cred) => ipcRenderer.invoke('api-update-credential', id, cred),
    deleteCredential: (id) => ipcRenderer.invoke('api-delete-credential', id),

    // Password generator
    generatePassword: (opts) => ipcRenderer.invoke('api-generate-password', opts),

    // Wipe / reset
    wipeVault: () => ipcRenderer.invoke('api-wipe-vault')
});
