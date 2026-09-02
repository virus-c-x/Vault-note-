# Vault Note 🛡️

> **Offline-first, zero-knowledge, privacy-focused password manager and secure notes vault.**

[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](LICENSE)
[![Security: Zero-Knowledge](https://img.shields.io/badge/Security-Zero--Knowledge-emerald.svg)](SECURITY.md)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline--First-blue.svg)](README.md)
[![Developed by](https://img.shields.io/badge/Developer-virus--c--x-purple.svg)](https://github.com/virus-c-x)
[![Team](https://img.shields.io/badge/Team-VIRUS%20TEAM-red.svg)](README.md)

Vault Note is a fully client-side web application designed from the ground up for total privacy and sovereign data ownership. There are no user accounts, no cloud servers, no database backends, no tracking pixels, and no analytics. Your sensitive credentials never leave your browser unencrypted.

---

## 🔒 Security & Cryptographic Architecture

| Feature | Implementation |
| :--- | :--- |
| **Symmetric Cipher** | **AES-256-GCM** with 128-bit authentication tag |
| **Key Derivation** | **PBKDF2** with **SHA-256** and **600,000 rounds** |
| **Entropy & Nonce** | 256-bit random salt, 96-bit unique IV generated per encryption via Web Crypto |
| **Local Persistence** | **IndexedDB** (`VaultNoteDB`) storing only encrypted ciphertexts and salts |
| **Biometric Quick Unlock** | Optional device-local WebAuthn hardware key wrapping (Master Password remains root) |
| **Telemetry & Network** | **Zero network requests** — operates 100% offline |
| **Memory Security** | Master Password and decrypted vault state are wiped immediately upon lock |

> ⚠️ **Zero-Knowledge Principle**: If you forget your Master Password, your encrypted data cannot be recovered. Vault Note has no backdoors, no password reset emails, and no recovery servers. Always maintain encrypted `.vault` backups.

---

## ✨ Features

- **🛡️ Zero-Knowledge Client-Side Cryptography**: Hardware-accelerated Web Cryptography API (`window.crypto.subtle`).
- **🌐 Offline Platform Selector & Quick Search**:
  - Searchable catalog of popular platforms (Google, GitHub, Discord, Steam, Spotify, Netflix, Apple, etc.).
  - Instant offline search with case-insensitive and partial matching.
  - Automatic suggested official website URLs and platform titles with full manual editing support.
  - Works 100% offline with zero external API calls or tracking.
- **👆 Optional Biometric Quick Unlock**:
  - Touch ID, Face ID, Windows Hello, and Android Biometrics integration via WebAuthn.
  - Uses device-local key-wrapping mechanism without replacing the Master Password as the cryptographic root.
  - Never transfers across devices and is never included in `.vault` backup files.
- **🔑 Three Core Item Types**:
  - **Logins**: Usernames, secure passwords, website URLs, notes, and tags.
  - **Bank Cards**: Auto brand detection (Visa, Mastercard, Amex, Discover), masked numbers & CVVs.
  - **Secure Notes**: Markdown and plain-text storage for recovery codes, server keys, and secrets.
- **📁 Organization**: Custom colored folders, flexible multi-tagging, and 1-click favorite bookmarking.
- **⚡ Fast Search & Sorting**: Real-time filtering across names, usernames, websites, tags, and notes.
- **🎲 Advanced Password Generator**:
  - Random alphanumeric & symbol passwords with customizable entropy.
  - Memorable passphrases with dictionary word selection.
  - Real-time Shannon entropy bits and brute-force crack time estimates.
- **💾 Import & Export**:
  - **.vault format**: Fully encrypted backups you can safely store anywhere.
  - **CSV import**: One-click import from Bitwarden, Google Chrome, and 1Password with preview and validation.
  - **Unencrypted export**: Optional JSON/CSV export with explicit security confirmations.
- **⏱️ Auto-Lock & Security Settings**:
  - Configurable inactivity auto-lock (1m, 5m, 15m, 30m, 60m).
  - Automatic clipboard clearing after 15s/30s/60s.
  - In-place Master Password rotation and vault re-encryption.
- **🎨 Frosted Glass UI**: Modern translucent surfaces, ambient lighting, and high-contrast typography.
- **📱 Offline PWA Support**: Install on iOS, Android, macOS, Windows, and Linux. Works seamlessly without an internet connection.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm

### Installation
```bash
# Clone repository
git clone https://github.com/virus-c-x/vault-note.git
cd vault-note

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Production Build
```bash
npm run build
```
The output will be placed in `dist/`, ready to be hosted as static files on GitHub Pages, Cloudflare Pages, Netlify, Vercel, or any static web server.

---

## 📂 Project Structure

```
vault-note/
├── .github/workflows/deploy.yml   # GitHub Pages deployment workflow
├── public/
│   ├── icon.svg                  # SVG master icon
│   └── pwa-*.png                 # Generated PWA icons
├── src/
│   ├── components/               # React UI components
│   │   ├── CreateVaultModal.tsx  # Initial vault creation with entropy checks
│   │   ├── FolderModal.tsx       # Folder management
│   │   ├── ImportExportModal.tsx # .vault & CSV backup / restore
│   │   ├── ItemDetail.tsx        # Vault item inspection & copy actions
│   │   ├── ItemList.tsx          # Item list with search & filters
│   │   ├── ItemModal.tsx         # Item creation & editor modal
│   │   ├── Navbar.tsx            # Navigation header & actions
│   │   ├── OfflineIndicator.tsx  # Network status badge
│   │   ├── PasswordGeneratorModal.tsx # Entropy & passphrase generator
│   │   ├── PlatformSelector.tsx  # Offline platform catalog & search
│   │   ├── PWAInstallButton.tsx  # In-app install banner & guide
│   │   ├── SettingsModal.tsx     # Security, biometric, and lock settings
│   │   ├── Sidebar.tsx           # Folder & tag navigation
│   │   ├── Toast.tsx             # Notification system
│   │   └── UnlockScreen.tsx      # Master Password & Biometric unlock
│   ├── crypto/                   # Cryptographic engine
│   │   ├── biometric.ts          # WebAuthn device-local key wrapping
│   │   ├── passwordGenerator.ts  # Entropy and generator
│   │   └── webCrypto.ts          # AES-256-GCM & PBKDF2 Web Crypto
│   ├── data/
│   │   └── platforms.ts          # Offline curated platform catalog
│   ├── hooks/                    # Auto-lock, PWA & offline hooks
│   ├── storage/                  # IndexedDB, CSV & .vault serializers
│   ├── App.tsx                   # Main state coordinator
│   ├── main.tsx                  # React entrypoint
│   └── types.ts                  # TypeScript schema definitions
├── vite.config.ts                # Vite & PWA configuration
├── SECURITY.md                   # Security specifications
├── CONTRIBUTING.md               # Contributing guide
└── LICENSE                       # MIT License
```

---

## 👥 Credits & Authors

- **Author / Developer**: [virus-c-x](https://github.com/virus-c-x)
- **Team**: **VIRUS TEAM**
- **Project**: Vault Note

---

## 📜 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
