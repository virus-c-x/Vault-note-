export type VaultItemType = 'login' | 'card' | 'note';

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'jcb' | 'diners' | 'unionpay' | 'other';

export interface VaultItemBase {
  id: string;
  type: VaultItemType;
  title: string;
  folderId: string | null;
  tags: string[];
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface LoginItem extends VaultItemBase {
  type: 'login';
  username: string;
  password: string;
  url: string;
  notes: string;
}

export interface BankCardItem extends VaultItemBase {
  type: 'card';
  cardholderName: string;
  cardNumber: string;
  expirationDate: string; // MM/YY
  cvv: string;
  brand: CardBrand;
  notes: string;
}

export interface SecureNoteItem extends VaultItemBase {
  type: 'note';
  content: string;
}

export type VaultItem = LoginItem | BankCardItem | SecureNoteItem;

export interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface VaultSettings {
  autoLockMinutes?: number;
  autoLockTimeout?: number; // in minutes (0 = disabled, 1, 5, 15, 30, 60)
  theme?: 'dark' | 'light';
  clipboardClearSeconds?: number;
  clipboardClearTimeout?: number; // in seconds (e.g. 30)
  pbkdf2Iterations?: number;
}

export interface DecryptedVault {
  vaultId?: string;
  vaultName: string;
  name?: string;
  version: number;
  folders: Folder[];
  items: VaultItem[];
  settings: VaultSettings;
}

export interface EncryptedVaultPayload {
  format: 'vault-note';
  version: number;
  createdAt: number;
  lastModified: number;
  kdf: {
    algorithm: 'PBKDF2';
    hash: 'SHA-256';
    iterations: number;
    salt: string; // base64
  };
  encryption: {
    algorithm: 'AES-256-GCM';
    iv: string; // base64
  };
  ciphertext: string; // base64
}

export interface CSVImportItem {
  id: string;
  type: VaultItemType;
  title: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  folderName?: string;
  isFavorite?: boolean;
  selected: boolean;
  hasConflict?: boolean;
}

export interface PasswordGeneratorOptions {
  mode: 'password' | 'passphrase';
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeSimilar: boolean;
  wordCount: number;
  separator: string;
  capitalizeWords: boolean;
  includeNumberInPassphrase: boolean;
}

export interface PasswordStrength {
  score: number; // 0 to 4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  entropyBits: number;
  crackTimeDisplay: string;
  feedback: string[];
}

export type ActiveSection = 'all' | 'logins' | 'cards' | 'notes' | 'favorites' | 'folder' | 'tag';

export type SortOption = 'title-asc' | 'title-desc' | 'updated-desc' | 'created-desc';

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}
