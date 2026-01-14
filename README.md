<p align="center">
  <img src="assets/icon.png" width="125" style="border-radius:12px;" />
</p>

<p align="center">
  <strong>A minimalist, local‑only vault for passwords, usernames, and notes — secured with a master password.</strong><br/>
  No cloud. No sync. No telemetry. Your data stays on your machine.
</p>

<p align="center">
  Made by <strong>ZFordDev</strong>
</p>

---

# 🚧 NestKey Is Being Rebuilt in Rust + Tauri

NestKey began as an Electron prototype — a way to explore encryption workflows, local‑only storage, and a clean, minimal UX for sensitive data.  
That prototype served its purpose, but it also revealed the limits of Electron for a security‑focused desktop vault.

To move NestKey forward in a way that reflects my standards for security, performance, and long‑term maintainability, the project is now being **rebuilt from the ground up using Rust + Tauri + Svelte**.

### Why the switch?

- **Security as a first‑class concern**  
  Rust provides memory‑safe, high‑performance cryptography with a minimal attack surface.

- **Lightweight, native‑feeling desktop app**  
  Tauri produces tiny binaries, uses the system WebView, and avoids bundling a full browser engine.

- **Cross‑platform by design**  
  Windows, macOS, and Linux builds are supported out of the box.

- **A clean architecture for long‑term evolution**  
  The Rust backend becomes the foundation for future tools, extensions, and the broader ZetoLabs ecosystem.

The Electron version is now archived and no longer maintained.

---

# 🗂️ What’s Coming in the Rust Edition

- Secure, encrypted vault storage  
- Strong key‑derivation (Argon2id) and AES‑256‑GCM encryption  
- Cross‑platform desktop UI (Windows, macOS, Linux)  
- Clean Svelte interface  
- Multi‑vault support (future)  
- Import/export (future)  
- A codebase built for long‑term growth and ecosystem integration

Development is active and ongoing.

---

# 🕹️ About the Old Prototype

The original Electron build explored:

- PIN‑derived encryption  
- AES‑256‑GCM vault storage  
- Local‑only data flow  
- Minimalist UI patterns  
- Basic credential CRUD  
- Password generation  
- Light/dark themes  

It was never intended as a production‑grade vault, and it is now retired.  
If you're curious, the prototype code remains available in the repo history.

---

# 📦 Tech Stack (Current)

- **Rust** — secure backend, crypto, vault logic  
- **Tauri** — native desktop shell  
- **Svelte + Vite** — fast, modern UI  
- **AES‑256‑GCM** — authenticated encryption  
- **Argon2id** — memory‑hard key derivation  

---

# 📜 License

MIT License — free to use, modify, and build upon.

---

# 🌐 Explore More

See what else I'm building at:  
https://zford.dev

---