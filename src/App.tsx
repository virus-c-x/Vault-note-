import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  encryptVault,
  decryptVault,
  createDefaultVault,
} from './crypto/webCrypto';
import {
  getStoredEncryptedVault,
  saveEncryptedVault,
  deleteStoredEncryptedVault,
  hasStoredEncryptedVault,
} from './storage/indexedDB';
import {
  ActiveSection,
  DecryptedVault,
  EncryptedVaultPayload,
  Folder,
  SortOption,
  ToastNotification,
  VaultItem,
  VaultItemType,
} from './types';
import { UnlockScreen } from './components/UnlockScreen';
import { CreateVaultModal } from './components/CreateVaultModal';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ItemList } from './components/ItemList';
import { ItemDetail } from './components/ItemDetail';
import { ItemModal } from './components/ItemModal';
import { FolderModal } from './components/FolderModal';
import { PasswordGeneratorModal } from './components/PasswordGeneratorModal';
import { ImportExportModal } from './components/ImportExportModal';
import { SettingsModal } from './components/SettingsModal';
import { Toast } from './components/Toast';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useAutoLock } from './hooks/useAutoLock';

export default function App() {
  // Vault state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasExistingVault, setHasExistingVault] = useState(false);
  const [decryptedVault, setDecryptedVault] = useState<DecryptedVault | null>(null);
  const [encryptedPayload, setEncryptedPayload] = useState<EncryptedVaultPayload | null>(null);
  const [masterPassword, setMasterPassword] = useState<string | null>(null);

  // Navigation & Filtering
  const [activeSection, setActiveSection] = useState<ActiveSection>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('title-asc');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<VaultItem | null>(null);
  const [itemModalInitialType, setItemModalInitialType] = useState<VaultItemType>('login');
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // UI state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Check if vault exists in IndexedDB on initial mount
  useEffect(() => {
    async function checkVault() {
      try {
        const exists = await hasStoredEncryptedVault();
        setHasExistingVault(exists);
      } catch (err) {
        console.error('Error checking stored vault:', err);
      }
    }
    checkVault();
  }, []);

  // Sync theme with HTML class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Toast Helper
  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Lock Vault (Clears decrypted state and in-memory password)
  const handleLockVault = useCallback(() => {
    setIsUnlocked(false);
    setDecryptedVault(null);
    setMasterPassword(null);
    setSelectedItemId(null);
    setIsMobileDetailOpen(false);
    showToast('Vault locked securely.', 'info');
  }, [showToast]);

  // Inactivity Auto-Lock Hook
  const autoLockMinutes = decryptedVault?.settings?.autoLockMinutes ?? 15;
  useAutoLock({
    timeoutMinutes: autoLockMinutes,
    isUnlocked: isUnlocked,
    onLock: handleLockVault,
  });


  // Save vault state changes (encrypt with master password & persist to IndexedDB)
  const persistVaultChanges = async (
    updatedVault: DecryptedVault,
    passwordOverride?: string
  ) => {
    const pass = passwordOverride || masterPassword;
    if (!pass) throw new Error('No active encryption key available.');

    const newEncryptedPayload = await encryptVault(
      updatedVault,
      pass,
      encryptedPayload?.kdf?.salt
    );


    await saveEncryptedVault(newEncryptedPayload);
    setDecryptedVault(updatedVault);
    setEncryptedPayload(newEncryptedPayload);
    setHasExistingVault(true);
  };

  // Unlock Vault handler
  const handleUnlock = async (password: string) => {
    const payload = await getStoredEncryptedVault();
    if (!payload) throw new Error('No stored vault found.');

    const decrypted = await decryptVault(payload, password);
    setMasterPassword(password);
    setEncryptedPayload(payload);
    setDecryptedVault(decrypted);
    setIsUnlocked(true);
    showToast(`Welcome back! "${decrypted.name}" unlocked.`, 'success');
  };

  // Create new vault handler
  const handleCreateVault = async (newVault: DecryptedVault, password: string) => {
    await persistVaultChanges(newVault, password);
    setMasterPassword(password);
    setIsUnlocked(true);
    setIsCreateModalOpen(false);
    showToast('New encrypted vault created and secured!', 'success');
  };

  // Import existing .vault payload from unlock screen
  const handleImportUnlockPayload = async (
    payload: EncryptedVaultPayload,
    passwordPrompt?: string
  ) => {
    if (!passwordPrompt) throw new Error('Password required to decrypt imported vault.');
    const decrypted = await decryptVault(payload, passwordPrompt);

    await saveEncryptedVault(payload);
    setMasterPassword(passwordPrompt);
    setEncryptedPayload(payload);
    setDecryptedVault(decrypted);
    setIsUnlocked(true);
    setHasExistingVault(true);
    showToast(`Successfully opened "${decrypted.name}".`, 'success');
  };

  // Reset / Wipe Local Vault
  const handleResetVault = async () => {
    await deleteStoredEncryptedVault();
    setHasExistingVault(false);
    setDecryptedVault(null);
    setEncryptedPayload(null);
    setMasterPassword(null);
    setIsUnlocked(false);
    showToast('Local vault wiped.', 'info');
  };

  // Copy text to clipboard with optional auto-clear
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    const clearSecs = decryptedVault?.settings?.clipboardClearSeconds ?? 30;

    if (clearSecs > 0) {
      showToast(`${label} copied! Clipboard will clear in ${clearSecs}s.`, 'success');
      setTimeout(async () => {
        try {
          const currentClip = await navigator.clipboard.readText();
          if (currentClip === text) {
            await navigator.clipboard.writeText('');
            showToast('Clipboard cleared automatically for security.', 'info');
          }
        } catch {
          // Ignore readText permission denials in some browser contexts
        }
      }, clearSecs * 1000);
    } else {
      showToast(`${label} copied to clipboard.`, 'success');
    }
  };

  // Item management handlers
  const handleSaveItem = async (item: VaultItem) => {
    if (!decryptedVault) return;
    const existingIndex = decryptedVault.items.findIndex((i) => i.id === item.id);
    let newItems: VaultItem[];

    if (existingIndex >= 0) {
      newItems = [...decryptedVault.items];
      newItems[existingIndex] = item;
      showToast(`Updated "${item.title}".`, 'success');
    } else {
      newItems = [item, ...decryptedVault.items];
      showToast(`Added "${item.title}".`, 'success');
    }

    const updated: DecryptedVault = {
      ...decryptedVault,
      items: newItems,
    };

    await persistVaultChanges(updated);
    setSelectedItemId(item.id);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!decryptedVault) return;
    const target = decryptedVault.items.find((i) => i.id === itemId);
    const newItems = decryptedVault.items.filter((i) => i.id !== itemId);

    const updated: DecryptedVault = {
      ...decryptedVault,
      items: newItems,
    };

    await persistVaultChanges(updated);
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
      setIsMobileDetailOpen(false);
    }
    showToast(`Deleted "${target?.title || 'item'}".`, 'info');
  };

  const handleToggleFavorite = async (itemId: string) => {
    if (!decryptedVault) return;
    const newItems = decryptedVault.items.map((i) =>
      i.id === itemId ? { ...i, isFavorite: !i.isFavorite, updatedAt: Date.now() } : i
    );

    const updated: DecryptedVault = {
      ...decryptedVault,
      items: newItems,
    };

    await persistVaultChanges(updated);
  };

  // Folder management handlers
  const handleSaveFolder = async (folder: Folder) => {
    if (!decryptedVault) return;
    const existingIndex = decryptedVault.folders.findIndex((f) => f.id === folder.id);
    let newFolders: Folder[];

    if (existingIndex >= 0) {
      newFolders = [...decryptedVault.folders];
      newFolders[existingIndex] = folder;
      showToast(`Folder "${folder.name}" updated.`, 'success');
    } else {
      newFolders = [...decryptedVault.folders, folder];
      showToast(`Folder "${folder.name}" created.`, 'success');
    }

    const updated: DecryptedVault = {
      ...decryptedVault,
      folders: newFolders,
    };

    await persistVaultChanges(updated);
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!decryptedVault) return;
    const targetFolder = decryptedVault.folders.find((f) => f.id === folderId);
    const newFolders = decryptedVault.folders.filter((f) => f.id !== folderId);
    // Unassign deleted folder from items
    const newItems = decryptedVault.items.map((i) =>
      i.folderId === folderId ? { ...i, folderId: null } : i
    );

    const updated: DecryptedVault = {
      ...decryptedVault,
      folders: newFolders,
      items: newItems,
    };

    await persistVaultChanges(updated);
    if (activeSection === 'folder' && selectedFolderId === folderId) {
      setActiveSection('all');
      setSelectedFolderId(null);
    }
    showToast(`Deleted folder "${targetFolder?.name || ''}".`, 'info');
  };

  // Master Password Change
  const handleChangeMasterPassword = async (oldPass: string, newPass: string) => {
    if (!decryptedVault || !encryptedPayload) throw new Error('No vault loaded.');
    // Verify old password
    await decryptVault(encryptedPayload, oldPass);

    // Re-encrypt with new password
    await persistVaultChanges(decryptedVault, newPass);
    setMasterPassword(newPass);
  };

  // CSV items import handler
  const handleImportCsvItems = async (items: VaultItem[], targetFolderId: string | null) => {
    if (!decryptedVault) return;
    const itemsWithFolder = items.map((i) => ({
      ...i,
      folderId: targetFolderId || i.folderId,
    }));

    const updated: DecryptedVault = {
      ...decryptedVault,
      items: [...itemsWithFolder, ...decryptedVault.items],
    };

    await persistVaultChanges(updated);
  };

  // Import .vault file from inside dashboard
  const handleImportVaultFile = async (
    payload: EncryptedVaultPayload,
    mode: 'replace' | 'merge'
  ) => {
    if (!masterPassword) throw new Error('Master password not set.');
    const decrypted = await decryptVault(payload, masterPassword);

    if (mode === 'replace') {
      await persistVaultChanges(decrypted);
    } else {
      if (!decryptedVault) return;
      // Merge unique items by title & type
      const existingIds = new Set(decryptedVault.items.map((i) => i.id));
      const newItems = decrypted.items.filter((i) => !existingIds.has(i.id));

      const updated: DecryptedVault = {
        ...decryptedVault,
        items: [...decryptedVault.items, ...newItems],
        folders: [
          ...decryptedVault.folders,
          ...decrypted.folders.filter(
            (f) => !decryptedVault.folders.some((df) => df.id === f.id || df.name === f.name)
          ),
        ],
      };
      await persistVaultChanges(updated);
    }
  };

  // Filter & Sort Items
  const filteredAndSortedItems = useMemo(() => {
    if (!decryptedVault) return [];

    let list = decryptedVault.items;

    // Filter by Section
    if (activeSection === 'logins') {
      list = list.filter((i) => i.type === 'login');
    } else if (activeSection === 'cards') {
      list = list.filter((i) => i.type === 'card');
    } else if (activeSection === 'notes') {
      list = list.filter((i) => i.type === 'note');
    } else if (activeSection === 'favorites') {
      list = list.filter((i) => i.isFavorite);
    } else if (activeSection === 'folder' && selectedFolderId) {
      list = list.filter((i) => i.folderId === selectedFolderId);
    } else if (activeSection === 'tag' && selectedTag) {
      list = list.filter((i) => i.tags && i.tags.includes(selectedTag));
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((i) => {
        const titleMatch = i.title.toLowerCase().includes(q);
        const notesMatch = i.notes?.toLowerCase().includes(q);
        const tagsMatch = i.tags?.some((t) => t.toLowerCase().includes(q));

        if (i.type === 'login') {
          return (
            titleMatch ||
            notesMatch ||
            tagsMatch ||
            i.username?.toLowerCase().includes(q) ||
            i.url?.toLowerCase().includes(q)
          );
        }
        if (i.type === 'card') {
          return (
            titleMatch ||
            notesMatch ||
            tagsMatch ||
            i.cardholderName?.toLowerCase().includes(q) ||
            i.cardNumber?.includes(q) ||
            i.brand?.toLowerCase().includes(q)
          );
        }
        if (i.type === 'note') {
          return titleMatch || tagsMatch || i.content?.toLowerCase().includes(q);
        }
        return titleMatch || notesMatch || tagsMatch;
      });
    }

    // Sort Items
    return [...list].sort((a, b) => {
      if (sortOption === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      if (sortOption === 'title-desc') {
        return b.title.localeCompare(a.title);
      }
      if (sortOption === 'updated-desc') {
        return b.updatedAt - a.updatedAt;
      }
      if (sortOption === 'created-desc') {
        return b.createdAt - a.createdAt;
      }
      return 0;
    });
  }, [decryptedVault, activeSection, selectedFolderId, selectedTag, searchQuery, sortOption]);

  // Selected item reference
  const selectedItem = useMemo(() => {
    if (!decryptedVault || !selectedItemId) return null;
    return decryptedVault.items.find((i) => i.id === selectedItemId) || null;
  }, [decryptedVault, selectedItemId]);

  // Filter Title for Item List
  const filterTitle = useMemo(() => {
    if (searchQuery.trim()) return `Search: "${searchQuery}"`;
    if (activeSection === 'all') return 'All Items';
    if (activeSection === 'logins') return 'Logins';
    if (activeSection === 'cards') return 'Bank Cards';
    if (activeSection === 'notes') return 'Secure Notes';
    if (activeSection === 'favorites') return 'Favorites';
    if (activeSection === 'folder' && selectedFolderId) {
      const folder = decryptedVault?.folders.find((f) => f.id === selectedFolderId);
      return folder ? `Folder: ${folder.name}` : 'Folder';
    }
    if (activeSection === 'tag' && selectedTag) {
      return `Tag: #${selectedTag}`;
    }
    return 'All Items';
  }, [activeSection, selectedFolderId, selectedTag, searchQuery, decryptedVault]);

  // Render Unlock Screen if vault is locked
  if (!isUnlocked) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <OfflineIndicator />
        <Toast toasts={toasts} onClose={removeToast} />
        <UnlockScreen
          hasExistingVault={hasExistingVault}
          onUnlock={handleUnlock}
          onCreateNewClick={() => setIsCreateModalOpen(true)}
          onImportVaultPayload={handleImportUnlockPayload}
          onResetVault={handleResetVault}
        />
        <CreateVaultModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateVault}
        />
      </div>
    );
  }

  // Render Unlocked Main Dashboard
  return (
    <div className={`flex flex-col h-screen w-screen bg-[#0a0a0c] text-[#f8fafc] overflow-hidden relative ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Frosted Glass Ambient Lighting Orbs */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-950/15 rounded-full blur-[150px] pointer-events-none z-0" />

      <OfflineIndicator />
      <Toast toasts={toasts} onClose={removeToast} />

      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onOpenNewItemModal={(type = 'login') => {
          setItemToEdit(null);
          setItemModalInitialType(type);
          setIsItemModalOpen(true);
        }}
        onOpenGeneratorModal={() => setIsGeneratorOpen(true)}
        onLockVault={handleLockVault}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        totalItemsCount={decryptedVault?.items.length || 0}
      />

      {/* Main 3-Column Layout */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Left Sidebar */}
        <Sidebar
          items={decryptedVault?.items || []}
          folders={decryptedVault?.folders || []}
          activeSection={activeSection}
          selectedFolderId={selectedFolderId}
          selectedTag={selectedTag}
          onSelectSection={(section) => {
            setActiveSection(section);
            setSelectedFolderId(null);
            setSelectedTag(null);
          }}
          onSelectFolder={(fId) => {
            setActiveSection('folder');
            setSelectedFolderId(fId);
            setSelectedTag(null);
          }}
          onSelectTag={(tag) => {
            setActiveSection('tag');
            setSelectedTag(tag);
            setSelectedFolderId(null);
          }}
          onOpenFolderModal={(folder) => {
            setFolderToEdit(folder || null);
            setIsFolderModalOpen(true);
          }}
          onDeleteFolder={handleDeleteFolder}
          onOpenImportExport={() => setIsImportExportOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenGenerator={() => setIsGeneratorOpen(true)}
          onLockVault={handleLockVault}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          autoLockMinutes={autoLockMinutes}
        />

        {/* Center Item List */}
        <div
          className={`w-full md:w-80 lg:w-96 shrink-0 h-full ${
            isMobileDetailOpen ? 'hidden md:block' : 'block'
          }`}
        >
          <ItemList
            items={filteredAndSortedItems}
            folders={decryptedVault?.folders || []}
            selectedItemId={selectedItemId}
            onSelectItem={(id) => {
              setSelectedItemId(id);
              setIsMobileDetailOpen(true);
            }}
            onToggleFavorite={handleToggleFavorite}
            onCopyText={handleCopyText}
            onOpenNewModal={() => {
              setItemToEdit(null);
              setItemModalInitialType('login');
              setIsItemModalOpen(true);
            }}
            sortOption={sortOption}
            onChangeSortOption={setSortOption}
            filterTitle={filterTitle}
          />
        </div>

        {/* Right Detail Pane */}
        <div
          className={`flex-1 h-full overflow-hidden ${
            !isMobileDetailOpen ? 'hidden md:block' : 'block'
          }`}
        >
          <ItemDetail
            item={selectedItem}
            folders={decryptedVault?.folders || []}
            onEditItem={(item) => {
              setItemToEdit(item);
              setIsItemModalOpen(true);
            }}
            onDeleteItem={handleDeleteItem}
            onToggleFavorite={handleToggleFavorite}
            onCopyText={handleCopyText}
            onCloseMobileDetail={() => setIsMobileDetailOpen(false)}
          />
        </div>
      </div>

      {/* Frosted Glass Footer Status Bar */}
      <footer className="h-9 shrink-0 border-t border-white/5 flex items-center justify-between px-6 bg-black/40 backdrop-blur-md text-[10px] text-slate-500 uppercase tracking-widest z-20">
        <div className="flex items-center gap-2">
          <span>Status:</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Secure &amp; Offline
          </span>
        </div>
        <div className="hidden sm:block">AES-256-GCM | 600,000 PBKDF2 Rounds</div>
        <div>Zero-Knowledge Protocol v2</div>
      </footer>

      {/* MODALS */}
      <ItemModal
        isOpen={isItemModalOpen}
        itemToEdit={itemToEdit}
        initialType={itemModalInitialType}
        folders={decryptedVault?.folders || []}
        currentFolderId={activeSection === 'folder' ? selectedFolderId : null}
        onClose={() => {
          setIsItemModalOpen(false);
          setItemToEdit(null);
        }}
        onSave={handleSaveItem}
      />

      <FolderModal
        isOpen={isFolderModalOpen}
        folderToEdit={folderToEdit}
        onClose={() => {
          setIsFolderModalOpen(false);
          setFolderToEdit(null);
        }}
        onSave={handleSaveFolder}
      />

      <PasswordGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onCopyPassword={(pwd) => handleCopyText(pwd, 'Password')}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        vault={decryptedVault}
        encryptedPayload={encryptedPayload}
        folders={decryptedVault?.folders || []}
        onImportCsvItems={handleImportCsvItems}
        onImportVaultFile={handleImportVaultFile}
        onShowToast={showToast}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        vault={decryptedVault}
        onClose={() => setIsSettingsOpen(false)}
        onChangeMasterPassword={handleChangeMasterPassword}
        onUpdateVaultSettings={persistVaultChanges}
        onWipeVault={handleResetVault}
        onShowToast={showToast}
      />
    </div>
  );
}
