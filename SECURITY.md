# Security Policy

## Core Security Model & Architecture

Vault Note is engineered under a strict **Zero-Knowledge** threat model:

1. **Client-Side Only**: All cryptographic operations occur exclusively in the client's web browser execution environment via the W3C Web Cryptography API (`window.crypto.subtle`).
2. **Zero Outbound Data**: Plaintext credentials, keys, master passwords, and metadata are never transmitted over the network.
3. **No Central Authority**: There are no servers, recovery keys, or telemetry collectors.
4. **Attribution**: Created by **virus-c-x** for the **VIRUS TEAM**.

---

## Cryptographic Implementation Details

### 1. Key Derivation (PBKDF2)
- **Algorithm**: `PBKDF2` with `SHA-256` digest
- **Iteration Count**: `600,000` iterations (meeting and exceeding OWASP recommendations)
- **Salt**: 256-bit (32 bytes) cryptographically secure pseudo-random number generated via `crypto.getRandomValues()`

### 2. Encryption (AES-256-GCM)
- **Algorithm**: `AES-GCM` (Galois/Counter Mode)
- **Key Length**: 256 bits
- **Initialization Vector (IV)**: 96-bit (12 bytes) unique random nonce generated per encryption
- **Authentication Tag**: 128-bit integrity tag verified automatically by Web Crypto during decryption

### 3. Optional Biometric Quick Unlock Architecture
- **Non-Root Key Model**: Biometric authentication never replaces the Master Password as the cryptographic root.
- **Hardware Ceremony**: Relies on WebAuthn user verification (`navigator.credentials.create` / `navigator.credentials.get`) with platform authenticators (Apple Touch ID / Face ID, Windows Hello, Android Biometrics).
- **Device-Bound Key Wrapping**: An ephemeral AES-GCM wrapping key is derived from local entropy and the platform authenticator assertion. The Master Password is wrapped and stored in device-local IndexedDB.
- **Strict Isolation**: Biometric credentials are strictly bound to the local origin and browser instance. They are **never exported**, **never synced**, and **never included** in `.vault` backup files.
- **Revocation**: Can be disabled at any time with a single click, instantly purging the local wrapped credentials.

### 4. In-Memory Security & Lifecycle
- **Session Locking**: Decrypted state and master passwords are kept only in active JavaScript closures during unlocked sessions.
- **Immediate Zeroing**: When the vault is locked (manually or via auto-lock inactivity timer), the decrypted records and keys are immediately released and replaced with `null`.
- **Clipboard Clearing**: Decrypted passwords copied to the system clipboard are scheduled for automatic clearing after a user-configured interval (default 30 seconds).

---

## Reporting a Vulnerability

If you discover a potential security flaw in Vault Note, please report it responsibly:

- Open a private security advisory on GitHub or contact the maintainer ([virus-c-x](https://github.com/virus-c-x)).
- Include reproduction steps and environment details.
- Please do not disclose vulnerabilities publicly before a fix has been released.
