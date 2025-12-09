/* app/renderer.js – UI logic (runs in renderer process) */
(() => {
    // Constants
    const THEMES = { DARK: 'dark', LIGHT: 'light' };
    const CLASSES = { HIDDEN: 'hidden' };
    const STATUS = { SUCCESS: 'success' };

    // Elements
    const lockScreen = document.getElementById('lock-screen');
    const lockMessage = document.getElementById('lock-message');
    const pinForm = document.getElementById('pin-form');
    const pinInput = document.getElementById('pin-input');

    const pinSetupDiv = document.getElementById('pin-setup');
    const pinSetupForm = document.getElementById('pin-setup-form');
    const pinNew = document.getElementById('pin-new');
    const pinConfirm = document.getElementById('pin-confirm');

    const mainApp = document.getElementById('main-app');
    const addBtn = document.getElementById('add-credential');
    const tableBody = document.querySelector('#credential-table tbody');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const vaultWipeBtn = document.getElementById('vault-wipe');

    const credDialog = document.getElementById('credential-dialog');
    const credForm = document.getElementById('credential-form');
    const dialogTitle = document.getElementById('dialog-title');
    const fieldSite = document.getElementById('field-site');
    const fieldUsername = document.getElementById('field-username');
    const fieldPassword = document.getElementById('field-password');
    const fieldNotes = document.getElementById('field-notes');
    const generatePassBtn = document.getElementById('generate-pass-btn');
    const togglePassVisBtn = document.getElementById('toggle-pass-visibility');
    const dialogCancelBtn = document.getElementById('dialog-cancel');

    const genDialog = document.getElementById('generator-dialog');
    const genForm = document.getElementById('generator-form');
    const genLength = document.getElementById('gen-length');
    const genLowercase = document.getElementById('gen-lowercase');
    const genUppercase = document.getElementById('gen-uppercase');
    const genNumbers = document.getElementById('gen-numbers');
    const genSymbols = document.getElementById('gen-symbols');
    const genCancelBtn = document.getElementById('gen-cancel');

    // State
    let editingEntryId = null; // null = add mode, otherwise edit

    // ---------------------------------------------------------------------------
    // Theme handling
    async function applySavedTheme() {
        const { theme } = await window.api.getTheme();
        if (theme === THEMES.DARK) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }

    async function toggleTheme() {
        const isDark = document.body.classList.toggle('dark');
        await window.api.setTheme(isDark ? THEMES.DARK : THEMES.LIGHT);
    }

    themeToggleBtn.addEventListener('click', toggleTheme);
    applySavedTheme();

    // ---------------------------------------------------------------------------
    // PIN handling
    // Open the lock screen dialog
    async function initLockScreen() {
        const isSet = await window.api.isPinSet();
        const lockScreenDialog = document.getElementById('lock-screen');

        if (!isSet) {
            // Show PIN creation UI
            lockMessage.textContent = 'Create a new PIN (4‑12 digits)';
            pinForm.classList.add('hidden');
            pinSetupDiv.classList.remove('hidden');
        } else {
            // Normal unlock UI
            lockMessage.textContent = 'Enter your PIN to unlock';
            pinForm.classList.remove('hidden');
            pinSetupDiv.classList.add('hidden');
        }

        // Show the lock screen dialog
        lockScreenDialog.showModal();
    }

    // Unlock form
    pinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pin = pinInput.value.trim();
        if (!pin) return;

        const res = await window.api.verifyPin(pin);
        if (res.success) {
            // Unlock succeeded
            const lockScreenDialog = document.getElementById('lock-screen');
            lockScreenDialog.close(); // Close the lock screen dialog
            mainApp.classList.remove('hidden'); // Show the main app
            loadVault();
        } else {
            alert('Incorrect PIN');
            pinInput.value = '';
        }
    });

    // PIN setup form
    pinSetupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPin = pinNew.value.trim();
        const confirmPin = pinConfirm.value.trim();
        if (newPin !== confirmPin) {
            alert('PINs do not match');
            return;
        }
        if (newPin.length < 4 || newPin.length > 12) {
            alert('PIN must be 4‑12 characters');
            return;
        }
        const res = await window.api.createPin(newPin);
        if (res.success) {
            alert('PIN created! Please unlock.');
            await initLockScreen();
        } else {
            alert('Error creating PIN: ' + (res.error || 'unknown'));
        }
    });

    // Initialize lock screen on page load
    initLockScreen();

    // ---------------------------------------------------------------------------
    // Vault operations
    async function loadVault() {
        try {
            const res = await window.api.getVault();
            if (!res.success) throw new Error(res.error || 'Unknown error');
            renderVault(res.vault);
        } catch (error) {
            alert(`Failed to load vault: ${error.message}`);
        }
    }

    function renderVault(vault) {
        console.log('Rendering vault:', vault); // Debugging
        tableBody.innerHTML = vault.map(entry => `
            <tr data-id="${entry.id}">
                <td data-label="Site">${entry.site}</td>
                <td data-label="Username">${entry.username}</td>
                <td data-label="Password">
                    <span data-actual="${entry.password}" data-visible="false">••••••••</span>
                    <button class="action-btn show-password">Show</button>
                </td>
                <td data-label="Notes">${entry.notes || ''}</td>
                <td data-label="Actions">
                    <button class="action-btn edit">Edit</button>
                    <button class="action-btn delete" data-id="${entry.id}">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    // ---------------------------------------------------------------------------
    // Add / Edit Credential
    addBtn.addEventListener('click', () => {
        editingEntryId = null;
        dialogTitle.textContent = 'Add Credential';
        credForm.reset();
        fieldPassword.type = 'text';
        credDialog.showModal();
    });

    dialogCancelBtn.addEventListener('click', () => credDialog.close());

    credForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const entry = {
            id: editingEntryId || crypto.randomUUID(),
            site: fieldSite.value.trim(),
            username: fieldUsername.value.trim(),
            password: fieldPassword.value,
            notes: fieldNotes.value.trim()
        };
        if (editingEntryId) {
            await window.api.updateCredential(entry.id, entry);
        } else {
            await window.api.addCredential(entry);
        }
        credDialog.close();
        loadVault();
    });

    function openEditDialog(entry) {
        editingEntryId = entry.id;
        dialogTitle.textContent = 'Edit Credential';
        fieldSite.value = entry.site;
        fieldUsername.value = entry.username;
        fieldPassword.value = entry.password;
        fieldNotes.value = entry.notes || '';
        credDialog.showModal();
    }

    // ---------------------------------------------------------------------------
    // Password generator
    generatePassBtn.addEventListener('click', () => {
        // Open generator dialog
        genDialog.showModal();
    });

    genCancelBtn.addEventListener('click', () => genDialog.close());

    genForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const opts = {
            length: parseInt(genLength.value, 10),
            lowercase: genLowercase.checked,
            uppercase: genUppercase.checked,
            numbers: genNumbers.checked,
            symbols: genSymbols.checked
        };
        const res = await window.api.generatePassword(opts);
        if (res.success) {
            fieldPassword.value = res.password;
            genDialog.close();
        } else {
            alert('Failed to generate password: ' + (res.error || 'unknown'));
        }
    });

    // Show / hide password in add/edit dialog
    togglePassVisBtn.addEventListener('click', () => {
        const visible = fieldPassword.type === 'text';
        fieldPassword.type = visible ? 'password' : 'text';
        togglePassVisBtn.textContent = visible ? 'Show' : 'Hide';
    });

    // ---------------------------------------------------------------------------
    // Vault wipe
    vaultWipeBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to permanently delete the vault? This action cannot be undone.')) {
            const res = await window.api.wipeVault();
            if (res.success) {
                alert('Vault wiped. The app will restart.');
                location.reload(); // simple reset
            } else {
                alert('Failed to wipe vault: ' + (res.error || 'unknown'));
            }
        }
    });

    tableBody.addEventListener('click', (e) => {
        const target = e.target;

        // Handle "Show Password" button
        if (target.matches('.action-btn.show-password')) {
            const passwordSpan = target.previousElementSibling; // The <span> containing the password
            const isVisible = passwordSpan.dataset.visible === 'true';
            if (isVisible) {
                passwordSpan.textContent = '••••••••';
                passwordSpan.dataset.visible = 'false';
                target.textContent = 'Show';
            } else {
                passwordSpan.textContent = passwordSpan.dataset.actual; // Show the actual password
                passwordSpan.dataset.visible = 'true';
                target.textContent = 'Hide';
            }
        }

        // Handle "Edit" button
        if (target.matches('.action-btn.edit')) {
            const row = target.closest('tr');
            const entry = {
                id: row.dataset.id,
                site: row.querySelector('[data-label="Site"]').textContent,
                username: row.querySelector('[data-label="Username"]').textContent,
                password: row.querySelector('[data-label="Password"] span').dataset.actual,
                notes: row.querySelector('[data-label="Notes"]').textContent,
            };
            openEditDialog(entry);
        }

        // Handle "Delete" button
        if (target.matches('.action-btn.delete')) {
            const entryId = target.dataset.id;
            console.log('Deleting entry with ID:', entryId); // Debugging
            if (confirm('Are you sure you want to delete this entry?')) {
                window.api.invoke('vault-delete', entryId).then((res) => {
                    if (res.success) {
                        console.log('Entry deleted successfully:', entryId); // Debugging
                        loadVault();
                    } else {
                        alert('Failed to delete entry: ' + (res.error || 'Unknown error'));
                    }
                }).catch((error) => {
                    alert('Failed to delete entry: ' + error.message);
                });
            }
        }
    });

    function debounce(func, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    }

    function openDialog(dialog, resetForm = true) {
        if (resetForm) dialog.querySelector('form').reset();
        dialog.showModal();
    }

    function closeDialog(dialog) {
        dialog.close();
    }

    function showLockScreen() {
        lockScreen.classList.remove('hidden');
        mainApp.classList.add('hidden');
    }

    function showMainApp() {
        lockScreen.classList.add('hidden'); // Hide the lock screen
        mainApp.classList.remove('hidden'); // Show the main app
        mainApp.scrollIntoView({ behavior: 'smooth' }); // Ensure it snaps to the top
    }
})();

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
