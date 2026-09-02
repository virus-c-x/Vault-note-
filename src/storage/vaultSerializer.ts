import { EncryptedVaultPayload } from '../types';

/**
 * Validates that an imported object or JSON string is a valid EncryptedVaultPayload.
 */
export function validateVaultPayload(raw: unknown): EncryptedVaultPayload {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Invalid vault file: Root payload must be a JSON object.');
  }

  const obj = raw as Record<string, unknown>;

  if (obj.format !== 'vault-note') {
    throw new Error('Invalid vault file: Unsupported file format identifier.');
  }

  if (typeof obj.version !== 'number' || obj.version < 1) {
    throw new Error('Invalid vault file: Unsupported or missing version.');
  }

  const kdf = obj.kdf as Record<string, unknown> | undefined;
  if (!kdf || kdf.algorithm !== 'PBKDF2' || typeof kdf.salt !== 'string' || !kdf.salt.trim()) {
    throw new Error('Invalid vault file: Invalid or missing KDF parameters.');
  }

  const encryption = obj.encryption as Record<string, unknown> | undefined;
  if (
    !encryption ||
    encryption.algorithm !== 'AES-256-GCM' ||
    typeof encryption.iv !== 'string' ||
    !encryption.iv.trim()
  ) {
    throw new Error('Invalid vault file: Invalid or missing encryption parameters.');
  }

  if (typeof obj.ciphertext !== 'string' || !obj.ciphertext.trim()) {
    throw new Error('Invalid vault file: Ciphertext is missing or corrupted.');
  }

  return {
    format: 'vault-note',
    version: obj.version,
    createdAt: typeof obj.createdAt === 'number' ? obj.createdAt : Date.now(),
    lastModified: typeof obj.lastModified === 'number' ? obj.lastModified : Date.now(),
    kdf: {
      algorithm: 'PBKDF2',
      hash: 'SHA-256',
      iterations: typeof kdf.iterations === 'number' ? kdf.iterations : 600000,
      salt: kdf.salt,
    },
    encryption: {
      algorithm: 'AES-256-GCM',
      iv: encryption.iv,
    },
    ciphertext: obj.ciphertext,
  };
}

/**
 * Parses a raw file text into a validated EncryptedVaultPayload.
 */
export function parseVaultFileContent(fileContent: string): EncryptedVaultPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(fileContent);
  } catch {
    throw new Error('Failed to parse file. Ensure it is a valid .vault JSON file.');
  }
  return validateVaultPayload(parsed);
}

/**
 * Triggers browser download of an encrypted .vault backup file.
 */
export function downloadEncryptedVaultFile(payload: EncryptedVaultPayload, filename = 'vault-backup.vault'): void {
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Triggers download of unencrypted plaintext export (JSON or CSV).
 */
export function downloadDecryptedExport(vault: unknown, format: 'csv' | 'json', filenamePrefix = 'vault-export'): void {
  const cleanPrefix = filenamePrefix.replace(/[^a-zA-Z0-9_-]/g, '_');
  const now = new Date().toISOString().slice(0, 10);

  if (format === 'json') {
    const jsonStr = JSON.stringify(vault, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cleanPrefix}-${now}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  // Format as CSV
  const vaultObj = vault as { items?: Array<{ type: string; title: string; username?: string; password?: string; url?: string; notes?: string; tags?: string[] }> };
  const items = vaultObj?.items || [];
  const escapeCsv = (val?: string) => `"${(val || '').replace(/"/g, '""')}"`;

  const headers = ['type', 'name', 'login_username', 'login_password', 'login_uri', 'notes', 'tags'];
  const rows = items.map((item) => [
    escapeCsv(item.type),
    escapeCsv(item.title),
    escapeCsv(item.username),
    escapeCsv(item.password),
    escapeCsv(item.url),
    escapeCsv(item.notes),
    escapeCsv(item.tags?.join(', ')),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${cleanPrefix}-${now}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

