import { DecryptedVault, EncryptedVaultPayload } from '../types';

export const PBKDF2_ITERATIONS = 600000;
export const SALT_BYTE_LENGTH = 32; // 256 bits
export const IV_BYTE_LENGTH = 12; // 96 bits for AES-GCM
export const AES_KEY_LENGTH = 256; // 256-bit AES

/**
 * Converts a Uint8Array to a Base64 string safely.
 */
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Converts a Base64 string to a Uint8Array.
 */
export function base64ToBytes(base64: string): Uint8Array {
  const binary = window.atob(base64.trim());
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generates cryptographically secure random bytes.
 */
export function getRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  window.crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * Generates a unique secure UUID.
 */
export function generateUUID(): string {
  if (typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  const bytes = getRandomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Derives an AES-256-GCM CryptoKey from a Master Password and Salt using PBKDF2-HMAC-SHA-256.
 */
export async function deriveKeyFromPassword(
  masterPassword: string,
  saltBytes: Uint8Array,
  iterations = PBKDF2_ITERATIONS
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(masterPassword);

  // Import raw password as key material for PBKDF2
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Derive AES-GCM 256-bit encryption key
  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: iterations,
      hash: 'SHA-256',
    },
    baseKey,
    {
      name: 'AES-GCM',
      length: AES_KEY_LENGTH,
    },
    false,
    ['encrypt', 'decrypt']
  );

  return derivedKey;
}

/**
 * Encrypts a DecryptedVault object into an EncryptedVaultPayload using AES-256-GCM.
 */
export async function encryptVault(
  vault: DecryptedVault,
  masterPassword: string,
  existingSaltBase64?: string
): Promise<EncryptedVaultPayload> {
  // Generate or reuse 32-byte salt
  const saltBytes = existingSaltBase64
    ? base64ToBytes(existingSaltBase64)
    : getRandomBytes(SALT_BYTE_LENGTH);

  // Generate a fresh 12-byte IV for every encryption operation
  const ivBytes = getRandomBytes(IV_BYTE_LENGTH);

  // Derive key
  const key = await deriveKeyFromPassword(masterPassword, saltBytes, PBKDF2_ITERATIONS);

  // Serialize vault plaintext to UTF-8
  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(JSON.stringify(vault));

  // Perform authenticated encryption with AES-GCM
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: ivBytes,
      tagLength: 128, // 128-bit authentication tag
    },
    key,
    plaintextBytes
  );

  const ciphertextBytes = new Uint8Array(ciphertextBuffer);

  const payload: EncryptedVaultPayload = {
    format: 'vault-note',
    version: 1,
    createdAt: Date.now(),
    lastModified: Date.now(),
    kdf: {
      algorithm: 'PBKDF2',
      hash: 'SHA-256',
      iterations: PBKDF2_ITERATIONS,
      salt: bytesToBase64(saltBytes),
    },
    encryption: {
      algorithm: 'AES-256-GCM',
      iv: bytesToBase64(ivBytes),
    },
    ciphertext: bytesToBase64(ciphertextBytes),
  };

  return payload;
}

/**
 * Decrypts an EncryptedVaultPayload into a DecryptedVault object using the Master Password.
 * Throws a clean error if decryption or authentication fails.
 */
export async function decryptVault(
  payload: EncryptedVaultPayload,
  masterPassword: string
): Promise<DecryptedVault> {
  // Validate format and parameters
  if (payload.format !== 'vault-note') {
    throw new Error('Invalid vault file format.');
  }

  if (payload.encryption.algorithm !== 'AES-256-GCM') {
    throw new Error(`Unsupported encryption algorithm: ${payload.encryption.algorithm}`);
  }

  if (payload.kdf.algorithm !== 'PBKDF2') {
    throw new Error(`Unsupported KDF algorithm: ${payload.kdf.algorithm}`);
  }

  const saltBytes = base64ToBytes(payload.kdf.salt);
  const ivBytes = base64ToBytes(payload.encryption.iv);
  const ciphertextBytes = base64ToBytes(payload.ciphertext);
  const iterations = payload.kdf.iterations || PBKDF2_ITERATIONS;

  try {
    const key = await deriveKeyFromPassword(masterPassword, saltBytes, iterations);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBytes,
        tagLength: 128,
      },
      key,
      ciphertextBytes
    );

    const decoder = new TextDecoder('utf-8');
    const jsonString = decoder.decode(decryptedBuffer);
    const parsed = JSON.parse(jsonString) as DecryptedVault;

    // Sanitize and ensure valid schema
    if (!parsed || !Array.isArray(parsed.items)) {
      throw new Error('Malformed vault data structure.');
    }

    // Default missing fields safely
    return {
      vaultId: parsed.vaultId || generateUUID(),
      vaultName: parsed.vaultName || 'My Vault',
      version: parsed.version || 1,
      folders: Array.isArray(parsed.folders) ? parsed.folders : [],
      items: parsed.items.map((item) => ({
        ...item,
        tags: Array.isArray(item.tags) ? item.tags : [],
        isFavorite: Boolean(item.isFavorite),
        createdAt: item.createdAt || Date.now(),
        updatedAt: item.updatedAt || Date.now(),
      })),
      settings: {
        autoLockTimeout: typeof parsed.settings?.autoLockTimeout === 'number' ? parsed.settings.autoLockTimeout : 15,
        theme: parsed.settings?.theme === 'light' ? 'light' : 'dark',
        clipboardClearTimeout: typeof parsed.settings?.clipboardClearTimeout === 'number' ? parsed.settings.clipboardClearTimeout : 30,
      },
    };
  } catch (err: unknown) {
    console.error('Decryption failed:', err);
    throw new Error('Incorrect Master Password or corrupted vault data.');
  }
}

/**
 * Creates an empty default vault structure.
 */
export function createDefaultVault(vaultName = 'My Vault'): DecryptedVault {
  const personalFolderId = generateUUID();
  const workFolderId = generateUUID();

  return {
    vaultId: generateUUID(),
    vaultName,
    version: 1,
    folders: [
      {
        id: personalFolderId,
        name: 'Personal',
        color: '#8b5cf6', // Violet
        createdAt: Date.now(),
      },
      {
        id: workFolderId,
        name: 'Work',
        color: '#3b82f6', // Blue
        createdAt: Date.now(),
      },
    ],
    items: [],
    settings: {
      autoLockTimeout: 15,
      theme: 'dark',
      clipboardClearTimeout: 30,
    },
  };
}
