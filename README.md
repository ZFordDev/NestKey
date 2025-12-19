
# **NestKey**  

<p align="center">
  <img src="assets/icon.png" width="140" style="border-radius:12px;" />
</p>

<p align="center">
  <strong>A minimalist, local‑only vault for passwords, usernames, and notes — secured with a user‑chosen PIN.</strong><br/>
  No cloud. No sync. No telemetry. Your data stays on your machine.
</p>

<p align="center">
  Made by <strong>ZFordDev</strong>
</p>

---

> **A Note from ZFordDev**  
NestKey development is taking a short break over the Christmas and New Year period.  
Thank you to everyone who has supported the project, tested early builds, and shared feedback - it genuinely means a lot.  
I’m looking forward to diving back in after the holidays and finishing the final polish for NestKey’s official Beta release in the new year.  
See you in 2026.

---

## **Overview**

NestKey is a lightweight, offline password manager designed as a practical exploration of:

- Secure local storage  
- Encryption workflows  
- Electron app packaging  
- Minimalist UX for sensitive data  

Everything is stored locally and encrypted. There is **no recovery**, no online services, and no hidden data flow.

---

## **Features**

### **PIN Lock**
- Create a PIN on first launch  
- PIN derives the encryption key  
- Required to unlock the vault  

### **Credential Vault**
- Add, edit, delete, and view entries  
- Fields: site, username, password, notes  
- Passwords hidden by default (toggle reveal)  

### **Password Generator**
- Custom length (4–64 chars)  
- Lowercase / uppercase / numbers / symbols  

### **Dark & Light Themes**
- Toggle anytime  
- Preference saved automatically  

### **Vault Wipe**
- Permanently deletes all encrypted data  
- No recovery — intentional by design  

### **Fully Offline**
- No network requests  
- No analytics  
- No cloud storage  

---

## **Getting Started**

```bash
# Build installers
npm run build

# Run in development
npm start

# Alternative build
npx electron-builder
```

> **Note:** During development, the PIN you set is baked into the built app.  
> Always reset before distributing.

On first launch, you’ll be prompted to **create a PIN**.  
This PIN is used to derive the encryption key that protects your vault.

---

## **Screenshot**

<p align="center">
  <img src="assets/Screenshot_01.png" width="700" />
  <br/>
  <em>Login screen — Light theme</em>
</p>

---

## **Security**

- **Key derivation:** PBKDF2‑SHA256 (200,000 iterations)  
- **Salt:** 16‑byte random  
- **Encryption:** AES‑256‑GCM (random IV + auth tag)  
- **Storage:** Encrypted JSON (`vault.enc`) in `app.getPath('userData')`

> ⚠️ **Warning**  
> The derived encryption key remains in memory for the lifetime of the app.  
> Not recommended for high‑value or enterprise‑grade secrets without further hardening.

---

## **Project Structure**

```
NestKey/
├── app/                  # Renderer (UI)
│   ├── index.html
│   ├── renderer.js
│   └── styles.css
├── assets/               # Icons / images
├── docs/                 # Documentation
├── main.js               # Electron main process
├── preload.js            # Secure context bridge
├── package.json
├── version.json
└── README.md

# Generated at runtime (do not commit):
# pin.json   — salt + hashed key
# vault.enc  — encrypted vault data
```

---

## **Known Issues**

- Delete Entry requires unique `id` per credential  
- Vault wipe is irreversible  
- Beta‑level security — not for high‑value secrets  

---

## **Roadmap**

### **Completed**
- PIN lock + encryption  
- Credential CRUD  
- Password generator  
- Theme toggle  
- Vault wipe  

### **Planned**
- UI polish + accessibility  
- Import / export vault  
- Multi‑vault support  
- Expanded documentation  

---

## **License**

MIT License — free to use, modify, and distribute.

---
## Explore More

See what else I'm building at:  
https://zford.dev
