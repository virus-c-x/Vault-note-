import React from 'react';
import {
  Layers,
  Key,
  CreditCard,
  FileText,
  Star,
  FolderPlus,
  Folder as FolderIcon,
  Tag as TagIcon,
  Settings,
  ArrowDownUp,
  Sparkles,
  Lock,
  MoreVertical,
  Edit2,
  Trash2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { ActiveSection, Folder, VaultItem } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface SidebarProps {
  items: VaultItem[];
  folders: Folder[];
  activeSection: ActiveSection;
  selectedFolderId: string | null;
  selectedTag: string | null;
  onSelectSection: (section: ActiveSection) => void;
  onSelectFolder: (folderId: string) => void;
  onSelectTag: (tag: string) => void;
  onOpenFolderModal: (folderToEdit?: Folder) => void;
  onDeleteFolder: (folderId: string) => void;
  onOpenImportExport: () => void;
  onOpenSettings: () => void;
  onOpenGenerator: () => void;
  onLockVault: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  autoLockMinutes: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  folders,
  activeSection,
  selectedFolderId,
  selectedTag,
  onSelectSection,
  onSelectFolder,
  onSelectTag,
  onOpenFolderModal,
  onDeleteFolder,
  onOpenImportExport,
  onOpenSettings,
  onOpenGenerator,
  onLockVault,
  isMobileOpen,
  onCloseMobile,
  autoLockMinutes,
}) => {
  const [activeFolderMenuId, setActiveFolderMenuId] = React.useState<string | null>(null);

  // Calculate counts
  const totalCount = items.length;
  const loginsCount = items.filter((i) => i.type === 'login').length;
  const cardsCount = items.filter((i) => i.type === 'card').length;
  const notesCount = items.filter((i) => i.type === 'note').length;
  const favoritesCount = items.filter((i) => i.isFavorite).length;

  // Extract all unique tags
  const tagsMap = new Map<string, number>();
  items.forEach((item) => {
    item.tags?.forEach((tag) => {
      const clean = tag.trim();
      if (clean) {
        tagsMap.set(clean, (tagsMap.get(clean) || 0) + 1);
      }
    });
  });
  const sortedTags = Array.from(tagsMap.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex w-64 md:w-72 flex-col justify-between border-r border-white/10 bg-white/5 backdrop-blur-2xl px-3.5 py-4 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-5 overflow-y-auto pr-1">
          {/* Mobile Header Close */}
          <div className="flex items-center justify-between md:hidden pb-2 border-b border-white/10">
            <span className="font-bold text-sm text-white">Vault Navigation</span>
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Primary Navigation */}
          <div className="space-y-1">
            <div className="px-2.5 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Vault Items
            </div>

            <button
              onClick={() => {
                onSelectSection('all');
                onCloseMobile();
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                activeSection === 'all'
                  ? 'bg-white/10 text-indigo-400 font-semibold border border-white/10 shadow-sm'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="h-4 w-4 text-indigo-400" />
                <span>All Items</span>
              </div>
              <span className="text-[11px] font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                {totalCount}
              </span>
            </button>

            <button
              onClick={() => {
                onSelectSection('logins');
                onCloseMobile();
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                activeSection === 'logins'
                  ? 'bg-white/10 text-indigo-400 font-semibold border border-white/10 shadow-sm'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Key className="h-4 w-4 text-indigo-400" />
                <span>Logins</span>
              </div>
              <span className="text-[11px] font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                {loginsCount}
              </span>
            </button>

            <button
              onClick={() => {
                onSelectSection('cards');
                onCloseMobile();
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                activeSection === 'cards'
                  ? 'bg-white/10 text-indigo-400 font-semibold border border-white/10 shadow-sm'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="h-4 w-4 text-purple-400" />
                <span>Bank Cards</span>
              </div>
              <span className="text-[11px] font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                {cardsCount}
              </span>
            </button>

            <button
              onClick={() => {
                onSelectSection('notes');
                onCloseMobile();
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                activeSection === 'notes'
                  ? 'bg-white/10 text-indigo-400 font-semibold border border-white/10 shadow-sm'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-amber-400" />
                <span>Secure Notes</span>
              </div>
              <span className="text-[11px] font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                {notesCount}
              </span>
            </button>

            <button
              onClick={() => {
                onSelectSection('favorites');
                onCloseMobile();
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                activeSection === 'favorites'
                  ? 'bg-white/10 text-amber-400 font-semibold border border-white/10 shadow-sm'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star className="h-4 w-4 text-amber-400" />
                <span>Favorites</span>
              </div>
              <span className="text-[11px] font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                {favoritesCount}
              </span>
            </button>
          </div>

          {/* Folders / Categories Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2.5 pb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Folders
              </span>
              <button
                onClick={() => onOpenFolderModal()}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 p-0.5 rounded transition"
                title="Add New Folder"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>

            {folders.length === 0 ? (
              <p className="px-3 py-2 text-[11px] text-slate-500 italic">No custom folders created</p>
            ) : (
              folders.map((folder) => {
                const count = items.filter((i) => i.folderId === folder.id).length;
                const isSelected = activeSection === 'folder' && selectedFolderId === folder.id;

                return (
                  <div key={folder.id} className="group relative">
                    <button
                      onClick={() => {
                        onSelectFolder(folder.id);
                        onCloseMobile();
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                        isSelected
                          ? 'bg-white/10 text-indigo-400 font-semibold border border-white/10 shadow-sm'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate pr-6">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: folder.color || '#8b5cf6' }}
                        />
                        <span className="truncate">{folder.name}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                        {count}
                      </span>
                    </button>

                    {/* Folder Options Button */}
                    <div className="absolute right-9 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveFolderMenuId(activeFolderMenuId === folder.id ? null : folder.id);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10"
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>

                      {activeFolderMenuId === folder.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setActiveFolderMenuId(null)}
                          />
                          <div className="absolute right-0 mt-1 z-50 w-28 rounded-xl bg-[#0e0e12]/95 border border-white/10 p-1 shadow-2xl backdrop-blur-2xl">
                            <button
                              onClick={() => {
                                onOpenFolderModal(folder);
                                setActiveFolderMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-indigo-400" />
                              <span>Rename</span>
                            </button>
                            <button
                              onClick={() => {
                                onDeleteFolder(folder.id);
                                setActiveFolderMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-300 hover:bg-rose-500/10"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Tags Section */}
          {sortedTags.length > 0 && (
            <div className="space-y-1">
              <div className="px-2.5 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Tags
              </div>
              <div className="flex flex-wrap gap-1.5 px-2">
                {sortedTags.map(([tag, count]) => {
                  const isSelected = activeSection === 'tag' && selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        onSelectTag(tag);
                        onCloseMobile();
                      }}
                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-white/10'
                      }`}
                    >
                      <TagIcon className="h-3 w-3" />
                      <span>{tag}</span>
                      <span className="opacity-60 text-[10px]">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Utility Tools & Status */}
        <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
          {/* Security Status Badge */}
          <div className="flex items-center justify-between rounded-xl bg-indigo-600/10 border border-indigo-500/20 px-3 py-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span className="font-semibold text-slate-200">Vault Secure</span>
            </div>
            <span className="text-slate-400 font-mono text-[10px]">
              {autoLockMinutes > 0 ? `Auto: ${autoLockMinutes}m` : 'Auto-lock off'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={onOpenImportExport}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-2 text-xs font-medium text-slate-300 hover:text-white transition"
              title="Import & Export"
            >
              <ArrowDownUp className="h-3.5 w-3.5 text-indigo-400" />
              <span>Backup/CSV</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-2 text-xs font-medium text-slate-300 hover:text-white transition"
              title="Vault Settings"
            >
              <Settings className="h-3.5 w-3.5 text-indigo-400" />
              <span>Settings</span>
            </button>
          </div>

          {/* PWA Install link on mobile sidebar */}
          <PWAInstallButton variant="sidebar-item" />

          {/* Lock Button */}
          <button
            onClick={onLockVault}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-rose-500/30 py-2.5 text-xs font-medium text-slate-400 hover:text-rose-300 transition"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Lock Vault</span>
          </button>
        </div>
      </aside>
    </>
  );
};
