import { EncryptedVaultPayload } from '../types';

const DB_NAME = 'VaultNoteDB';
const DB_VERSION = 1;
const STORE_NAME = 'encrypted_vault';
const VAULT_RECORD_KEY = 'primary_vault';

/**
 * Opens and initializes the IndexedDB database instance.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB.'));
    };
  });
}

/**
 * Saves the encrypted vault payload to IndexedDB.
 */
export async function saveEncryptedVault(payload: EncryptedVaultPayload): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(payload, VAULT_RECORD_KEY);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to save vault to IndexedDB.'));
    };
  });
}

/**
 * Retrieves the encrypted vault payload from IndexedDB.
 */
export async function getEncryptedVault(): Promise<EncryptedVaultPayload | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(VAULT_RECORD_KEY);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to load vault from IndexedDB.'));
    };
  });
}

/**
 * Checks whether an encrypted vault already exists in local storage.
 */
export async function hasLocalVault(): Promise<boolean> {
  try {
    const vault = await getEncryptedVault();
    return Boolean(vault && vault.ciphertext);
  } catch {
    return false;
  }
}

/**
 * Deletes the local encrypted vault from IndexedDB.
 */
export async function deleteLocalVault(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(VAULT_RECORD_KEY);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to delete local vault.'));
    };
  });
}

/**
 * Prepares an encrypted .vault download file.
 */
export function createVaultDownloadBlob(payload: EncryptedVaultPayload): Blob {
  const jsonString = JSON.stringify(payload, null, 2);
  return new Blob([jsonString], { type: 'application/json' });
}

// Aliases for clear descriptive naming
export const getStoredEncryptedVault = getEncryptedVault;
export const deleteStoredEncryptedVault = deleteLocalVault;
export const hasStoredEncryptedVault = hasLocalVault;

