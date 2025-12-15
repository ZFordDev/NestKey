# NestKey  

<p align="center">
  <img src="assets/icon.png" alt="NestKey Icon" width="150" style="border-radius:12px;" /><br/>
</p>

<p align="center">
   NestKey — Offline password manager built with Electron. <br/>
   A minimalist vault for usernames, passwords, and notes — stored <strong>locally</strong> and <strong>encrypted</strong> with a user‑chosen PIN.
</p>

<p align="center">
Made By ZFordDev
</p>

---

## Overview  

NestKey is a **proof‑of‑concept** for a simple, offline password manager.  
It focuses on privacy, minimalism, and local‑only storage — no cloud, no sync, no telemetry.

- **PIN‑locked** entry screen  
- **Credential vault** (add / edit / delete / reveal passwords)  
- **Password generator** (custom length & character sets)  
- **Dark / Light mode** toggle (saved preference)  
- **Vault wipe** (permanent delete of all credentials)  
- **Fully offline** — no internet traffic  

_**Note:** This is not a toy. There are no recovery measures, and forgetting your PIN will result in permanent data loss._

---

## Why I built this

NestKey was built to explore secure local storage, encryption workflows, and Electron app packaging. It serves as a practical demonstration of my ability to design, build, and document a complete desktop application.

---

## Getting Started  

```bash
# Build installers
npm run build
# installers will appear in dist/

# Run the app in development
npm start

# Also builds installers
npx electron-builder
# Note: the PIN you set during testing will be baked into the built app.
```

On first launch you’ll be asked to **create a PIN**.  
This PIN derives the encryption key that protects your vault.

---

## Screenshots

<div align="center">
    <img src="assets/Screenshot_01.png" alt="Login screen" width="700" />
    <br/>
    <em>Live preview — Light theme</em>
</div>

---

## 🛠 Features  

### PIN Lock  
- Requires a user‑chosen PIN to unlock the vault.  
- If no PIN is set, the app prompts you to create one.  

### Credential Vault  
- Add, edit, delete, and view credentials (site, username, password, notes).  
- Passwords hidden by default, revealable with “Show Password.”  

### Password Generator  
- Generate strong passwords with customizable options:  
  - Length (4–64 characters)  
  - Include lowercase, uppercase, numbers, symbols  

### Dark / Light Mode  
- Toggle between dark and light themes.  
- Preference saved and applied on next launch.  

### Vault Wipe  
- Permanently delete all stored credentials.  
- Irreversible action.  

### Fully Offline  
- All data stored locally on your device.  
- No internet connection required, no external data sent.  

---

## Project Structure  

```
NestKey/
├── app/                  # Renderer (UI) code
│   ├── index.html        # Main HTML file
│   ├── renderer.js       # Frontend logic
│   └── styles.css        # App styling
├── assets/               # Icons / images
├── docs/                 # Documentation
├── .gitignore            # Files to ignore in Git
├── LICENSE               # License file
├── main.js               # Electron main process
├── preload.js            # Secure bridge (context‑bridge)
├── package.json          # App metadata and dependencies
├── README.md             # This file
└── version.json          # App versioning

# Auto-generated at runtime (never commit):
# pin.json — stores salt & hashed key
# vault.enc — encrypted vault data
```

---

## Security  

- **PIN → key**: PBKDF2‑SHA256 (200 000 iterations) with 16‑byte random salt.  
- **Vault encryption**: AES‑256‑GCM (random IV + auth tag).  
- **Storage**: Encrypted JSON (`vault.enc`) stored in `app.getPath('userData')`.  

> ⚠️ **Warning**  
> The current implementation keeps the derived encryption key in memory for the lifetime of the app.  
> Do not use this for high‑value credentials without further hardening.

---

## 🐞 Known Issues  

- Delete Entry requires unique `id` per credential.  
- Vault Wipe is irreversible — use with caution.  
- Beta status: not recommended for sensitive or high‑value credentials.  

---

## 🗺 Roadmap  

**Completed:**  
- PIN lock + vault encryption  
- Credential vault CRUD  
- Password generator  
- Dark / Light mode toggle  
- Vault wipe  

**Planned:**  
- UI polish & accessibility improvements  
- Export / import vault options  
- Multi‑vault support  
- Documentation expansion  

---

## License  

MIT License — free to use, modify, and distribute. Please keep this notice.

---

## Stay Connected  

- [**Join me on Discord**](https://discord.gg/4RGzagyt7C)  
- [**Find this project on GitHub**](https://github.com/ZFordDev/NestKey)  
- [**Connect on Facebook**](https://www.facebook.com/zachary.ford.944654)  

---

## ❤️ Support  

NestKey is free and open source. If it helps you, consider supporting the creator via ZetoLabs:  
- [**Ko‑Fi**](https://ko-fi.com/zetolabs)

---
