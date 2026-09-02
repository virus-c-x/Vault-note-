import { generateUUID } from '../crypto/webCrypto';
import { CSVImportItem, VaultItem } from '../types';

/**
 * Robust RFC 4180 compliant CSV line/record parser.
 */
export function parseCSVToRows(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped double quote ""
        currentField += '"';
        i++; // skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      // Handle \r\n or \n
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField);
      if (currentRow.some((field) => field.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Push final field/row if any
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some((field) => field.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Parses CSV content from Bitwarden, Chrome, or generic password managers.
 */
export function parsePasswordManagerCSV(
  csvContent: string,
  existingItems: VaultItem[] = []
): { items: CSVImportItem[]; detectedFormat: string } {
  const rows = parseCSVToRows(csvContent);
  if (rows.length < 2) {
    throw new Error('CSV file is empty or contains only a header row.');
  }

  const rawHeaders = rows[0].map((h) => h.trim().toLowerCase());
  const headerMap = new Map<string, number>();
  rawHeaders.forEach((header, index) => {
    headerMap.set(header, index);
  });

  let detectedFormat = 'Generic CSV';
  const isBitwarden = headerMap.has('login_username') || headerMap.has('login_uri') || (headerMap.has('folder') && headerMap.has('name'));
  const isChrome = headerMap.has('url') && headerMap.has('username') && headerMap.has('password') && !headerMap.has('login_uri');

  if (isBitwarden) {
    detectedFormat = 'Bitwarden CSV';
  } else if (isChrome) {
    detectedFormat = 'Google Chrome Passwords CSV';
  }

  const getCol = (possibleNames: string[]): number => {
    for (const name of possibleNames) {
      if (headerMap.has(name)) return headerMap.get(name)!;
    }
    return -1;
  };

  const titleCol = getCol(['name', 'title', 'account', 'login_title']);
  const userCol = getCol(['username', 'login_username', 'user', 'login', 'email']);
  const passCol = getCol(['password', 'login_password', 'pass']);
  const urlCol = getCol(['url', 'login_uri', 'website', 'link', 'uri', 'web']);
  const notesCol = getCol(['notes', 'note', 'comments', 'comment', 'extra']);
  const folderCol = getCol(['folder', 'category', 'group']);
  const favCol = getCol(['favorite', 'is_favorite']);
  const typeCol = getCol(['type']);

  const parsedItems: CSVImportItem[] = [];
  const existingTitles = new Set(existingItems.map((item) => item.title.toLowerCase().trim()));

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length === 0 || row.every((c) => !c.trim())) continue;

    const title = (titleCol !== -1 ? row[titleCol] : '') || row[urlCol !== -1 ? urlCol : 0] || 'Imported Account';
    const username = userCol !== -1 ? row[userCol] || '' : '';
    const password = passCol !== -1 ? row[passCol] || '' : '';
    const url = urlCol !== -1 ? row[urlCol] || '' : '';
    const notes = notesCol !== -1 ? row[notesCol] || '' : '';
    const folderName = folderCol !== -1 ? row[folderCol] || '' : '';
    const favVal = favCol !== -1 ? (row[favCol] || '').toLowerCase() : '';
    const isFavorite = favVal === '1' || favVal === 'true' || favVal === 'yes';

    // Type detection (Bitwarden types: 1=login, 2=secure note, 3=card, 4=identity)
    let itemType: 'login' | 'card' | 'note' = 'login';
    if (typeCol !== -1) {
      const rawType = (row[typeCol] || '').toLowerCase().trim();
      if (rawType === '2' || rawType === 'note' || rawType === 'secure note') {
        itemType = 'note';
      } else if (rawType === '3' || rawType === 'card' || rawType === 'credit card') {
        itemType = 'card';
      }
    }

    // Skip empty dummy rows
    if (!title.trim() && !username.trim() && !password.trim() && !url.trim()) {
      continue;
    }

    const hasConflict = existingTitles.has(title.toLowerCase().trim());

    parsedItems.push({
      id: generateUUID(),
      type: itemType,
      title: title.trim(),
      username: username.trim(),
      password: password,
      url: url.trim(),
      notes: notes.trim(),
      folderName: folderName.trim() || undefined,
      isFavorite,
      selected: true,
      hasConflict,
    });
  }

  if (parsedItems.length === 0) {
    throw new Error('No valid password or note records could be parsed from the CSV file.');
  }

  return { items: parsedItems, detectedFormat };
}

/**
 * Convenient helper to parse a CSV string directly into VaultItem[] array.
 */
export function parseCsvToVaultItems(csvContent: string): VaultItem[] {
  const result = parsePasswordManagerCSV(csvContent);
  const now = Date.now();

  return result.items.map((item) => {
    const base = {
      id: item.id || generateUUID(),
      title: item.title,
      folderId: null,
      tags: item.folderName ? [item.folderName] : [],
      isFavorite: item.isFavorite,
      createdAt: now,
      updatedAt: now,
    };

    if (item.type === 'card') {
      return {
        ...base,
        type: 'card' as const,
        cardholderName: '',
        cardNumber: '',
        expirationDate: '',
        cvv: '',
        brand: 'other' as const,
        notes: item.notes || '',
      };
    }

    if (item.type === 'note') {
      return {
        ...base,
        type: 'note' as const,
        content: item.notes || item.title,
      };
    }

    return {
      ...base,
      type: 'login' as const,
      username: item.username || '',
      password: item.password || '',
      url: item.url || '',
      notes: item.notes || '',
    };
  });
}

