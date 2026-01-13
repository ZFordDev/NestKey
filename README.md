<p align="center">
  <img src="assets/icon.png" width="125" style="border-radius:12px;" />
</p>

<p align="center">
  <strong>A minimalist, local‑only vault for passwords, usernames, and notes — secured with a user‑chosen PIN.</strong><br/>
  No cloud. No sync. No telemetry. Your data stays on your machine.
</p>

<p align="center">
  Made by <strong>ZFordDev</strong>
</p>

---

# 🚧 NestKey Is Being Rebuilt in .NET (Avalonia)

NestKey began as an Electron prototype — a way to explore encryption workflows, local‑only storage, and a clean, minimal UX for sensitive data.  
That prototype served its purpose, but it also revealed the limits of Electron for a security‑focused desktop vault.

To move NestKey forward in a way that reflects my standards for security, performance, and long‑term maintainability, the project is now being **rebuilt from the ground up in .NET + Avalonia**.

### Why the switch?

- **Stronger security posture**  
  A native .NET codebase offers a tighter attack surface than a JavaScript runtime.

- **Better performance and memory behavior**  
  Ideal for encryption, vault operations, and long‑running sessions.

- **True cross‑platform desktop support**  
  Avalonia provides a consistent UI layer across Windows, macOS, and Linux.

- **Cleaner architecture for long‑term growth**  
  Multi‑vault support, import/export, and advanced features become far easier to implement.

The Electron version is now archived and no longer maintained.

---

# 🗂️ What’s Coming in the .NET Edition

- Native, secure vault storage  
- Stronger key‑derivation and encryption pipeline  
- Cross‑platform UI (Windows, macOS, Linux)  
- Multi‑vault support  
- Import/export  
- Cleaner, more polished UX  
- A codebase built for long‑term evolution

Development will begin soon, following the launch of **StaxDash**.

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

If you’re curious, the prototype code remains available in the repo history.

---

# 📜 License

MIT License — free to use, modify, and build upon.

---

# 🌐 Explore More

See what else I'm building at:  
https://zford.dev

---