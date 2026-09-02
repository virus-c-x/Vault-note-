import {
  bytesToBase64,
  base64ToBytes,
  getRandomBytes,
  deriveKeyFromPassword,
  SALT_BYTE_LENGTH,
  IV_BYTE_LENGTH,
} from './webCrypto';

const BIOMETRIC_STORAGE_KEY = 'vaultnote_biometric_device_credential';

export interface BiometricStatus {
  isSupported: boolean;
  isEnabled: boolean;
  error?: string;
}

/**
 * Checks if platform authenticator (Touch ID, Face ID, Windows Hello, Android Biometrics) is supported.
 */
export async function isBiometricAvailable(): Promise<boolean> {
  try {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) {
      return false;
    }
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== 'function') {
      return false;
    }
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/**
 * Checks if biometric quick unlock is currently configured on this local device.
 */
export function isBiometricEnabledLocally(): boolean {
  try {
    return Boolean(localStorage.getItem(BIOMETRIC_STORAGE_KEY));
  } catch {
    return false;
  }
}

/**
 * Enables biometric quick unlock on this device using WebAuthn user verification.
 * Encrypts the master password with a local device-bound key and stores the wrapped token.
 */
export async function setupBiometricQuickUnlock(masterPassword: string): Promise<boolean> {
  const available = await isBiometricAvailable();
  if (!available) {
    throw new Error('Biometric hardware authentication is not available or supported on this device/browser.');
  }

  // Generate a random challenge and credential ID for local platform authentication
  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const userId = new Uint8Array(16);
  window.crypto.getRandomValues(userId);

  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: {
        name: 'Vault Note',
        id: window.location.hostname === 'localhost' ? 'localhost' : undefined,
      },
      user: {
        id: userId,
        name: 'VaultNoteUser',
        displayName: 'Vault Note Local User',
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'discouraged',
      },
      timeout: 60000,
    },
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error('Biometric setup was cancelled or failed.');
  }

  // Derive a device-bound wrapping secret from credential rawId & local entropy
  const credentialRawId = new Uint8Array(credential.rawId);
  const rawIdB64 = bytesToBase64(credentialRawId);

  // Derive a wrapping key using PBKDF2 + AES-GCM
  const localWrappingPass = `VN_BIO_${rawIdB64}_${window.location.origin}`;
  const localSalt = getRandomBytes(SALT_BYTE_LENGTH);
  const localIv = getRandomBytes(IV_BYTE_LENGTH);

  const wrappingKey = await deriveKeyFromPassword(localWrappingPass, localSalt, 100000);

  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify({ masterPassword }));

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: localIv,
      tagLength: 128,
    },
    wrappingKey,
    plaintext
  );

  const storedData = {
    credentialId: credential.id,
    salt: bytesToBase64(localSalt),
    iv: bytesToBase64(localIv),
    ciphertext: bytesToBase64(new Uint8Array(encryptedBuffer)),
    createdAt: Date.now(),
  };

  localStorage.setItem(BIOMETRIC_STORAGE_KEY, JSON.stringify(storedData));
  return true;
}

/**
 * Attempts to unlock the vault using biometric verification.
 * Returns the decrypted master password if successful.
 */
export async function authenticateWithBiometrics(): Promise<string> {
  const rawStored = localStorage.getItem(BIOMETRIC_STORAGE_KEY);
  if (!rawStored) {
    throw new Error('Biometric unlock is not configured on this device.');
  }

  const storedData = JSON.parse(rawStored);
  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const credentialRawId = base64ToBytes(storedData.credentialId);

  const assertion = (await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [
        {
          id: credentialRawId,
          type: 'public-key',
          transports: ['internal'],
        },
      ],
      userVerification: 'required',
      timeout: 60000,
    },
  })) as PublicKeyCredential | null;

  if (!assertion) {
    throw new Error('Biometric authentication cancelled.');
  }

  // Reconstruct wrapping secret
  const rawIdB64 = bytesToBase64(new Uint8Array(assertion.rawId));
  const localWrappingPass = `VN_BIO_${rawIdB64}_${window.location.origin}`;
  const salt = base64ToBytes(storedData.salt);
  const iv = base64ToBytes(storedData.iv);
  const ciphertext = base64ToBytes(storedData.ciphertext);

  try {
    const wrappingKey = await deriveKeyFromPassword(localWrappingPass, salt, 100000);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
        tagLength: 128,
      },
      wrappingKey,
      ciphertext
    );

    const decoder = new TextDecoder();
    const decryptedJson = JSON.parse(decoder.decode(decryptedBuffer));

    if (!decryptedJson || !decryptedJson.masterPassword) {
      throw new Error('Decryption of local biometric token failed.');
    }

    return decryptedJson.masterPassword;
  } catch {
    throw new Error('Biometric key unwrapping failed. Please enter your Master Password.');
  }
}

/**
 * Disables biometric quick unlock and clears local wrapping tokens.
 */
export function disableBiometricQuickUnlock(): void {
  try {
    localStorage.removeItem(BIOMETRIC_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to remove biometric token:', err);
  }
}
