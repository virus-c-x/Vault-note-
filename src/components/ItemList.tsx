import React from 'react';
import {
  Key,
  CreditCard,
  FileText,
  Star,
  Copy,
  ExternalLink,
  Plus,
  ArrowUpDown,
  Tag as TagIcon,
  Search,
} from 'lucide-react';
import { Folder, SortOption, VaultItem } from '../types';

interface ItemListProps {
  items: VaultItem[];
  folders: Folder[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onCopyText: (text: string, label: string) => void;
  onOpenNewModal: () => void;
  sortOption: SortOption;
  onChangeSortOption: (option: SortOption) => void;
  filterTitle: string;
}

export const ItemList: React.FC<ItemListProps> = ({
  items,
  folders,
  selectedItemId,
  onSelectItem,
  onToggleFavorite,
  onCopyText,
  onOpenNewModal,
  sortOption,
  onChangeSortOption,
  filterTitle,
}) => {
  const getFolder = (folderId: string | null) => {
    if (!folderId) return null;
    return folders.find((f) => f.id === folderId);
  };

  const getItemSubtitle = (item: VaultItem) => {
    if (item.type === 'login') {
      return item.username || item.url || 'No username';
    }
    if (item.type === 'card') {
      const num = item.cardNumber ? item.cardNumber.slice(-4) : '••••';
      return `${(item.brand || 'Card').toUpperCase()} •••• ${num}`;
    }
    if (item.type === 'note') {
      const lines = item.content ? item.content.split('\n') : [];
      return lines[0] || 'Empty note';
    }
    return '';
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'login':
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shadow-sm">
            <Key className="h-4 w-4" />
          </div>
        );
      case 'card':
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 shadow-sm">
            <CreditCard className="h-4 w-4" />
          </div>
        );
      case 'note':
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shadow-sm">
            <FileText className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shadow-sm">
            <Key className="h-4 w-4" />
          </div>
        );
    }
  };

  return (
    <div className="flex h-full w-full flex-col border-r border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
      {/* List Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 bg-black/20 backdrop-blur-md">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-white">{filterTitle}</h2>
          <span className="text-[11px] text-slate-400 font-mono">
            {items.length} {items.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1.5">
          <div className="relative inline-block">
            <select
              value={sortOption}
              onChange={(e) => onChangeSortOption(e.target.value as SortOption)}
              className="appearance-none rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 pr-7 text-[11px] font-medium text-slate-300 hover:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer backdrop-blur-md transition"
            >
              <option value="title-asc" className="bg-[#0e0e12] text-white">Title (A–Z)</option>
              <option value="title-desc" className="bg-[#0e0e12] text-white">Title (Z–A)</option>
              <option value="updated-desc" className="bg-[#0e0e12] text-white">Recently Updated</option>
              <option value="created-desc" className="bg-[#0e0e12] text-white">Recently Created</option>
            </select>
            <ArrowUpDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Items Scrollable List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-500 mb-3 backdrop-blur-md">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">No items found</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-xs leading-relaxed">
              No vault entries match your active filter or search query.
            </p>
            <button
              onClick={onOpenNewModal}
              className="mt-4 flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New Item</span>
            </button>
          </div>
        ) : (
          items.map((item) => {
            const isSelected = selectedItemId === item.id;
            const folder = getFolder(item.folderId);
            const subtitle = getItemSubtitle(item);

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className={`group relative flex flex-col gap-2 rounded-2xl p-3.5 cursor-pointer transition-all duration-150 backdrop-blur-md ${
                  isSelected
                    ? 'bg-indigo-600/15 border border-indigo-500/40 shadow-lg shadow-indigo-500/10 border-b-2 border-b-indigo-500/60'
                    : 'bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {getItemIcon(item.type)}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-100 truncate group-hover:text-white">
                        {item.title}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                        {subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Favorite Star Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    className={`p-1 rounded-lg transition ${
                      item.isFavorite
                        ? 'text-amber-400 hover:text-amber-300'
                        : 'text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100'
                    }`}
                    title={item.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
                  >
                    <Star
                      className={`h-4 w-4 ${item.isFavorite ? 'fill-amber-400' : ''}`}
                    />
                  </button>
                </div>

                {/* Bottom Meta & Quick Copy Actions */}
                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/5 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5 truncate">
                    {folder && (
                      <span className="flex items-center gap-1 rounded-lg px-2 py-0.5 bg-white/5 text-slate-300 border border-white/10 font-medium">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: folder.color }}
                        />
                        <span className="truncate max-w-[80px]">{folder.name}</span>
                      </span>
                    )}

                    {item.tags && item.tags.length > 0 && (
                      <span className="flex items-center gap-1 rounded-lg px-2 py-0.5 bg-white/5 text-slate-400 border border-white/5 truncate">
                        <TagIcon className="h-2.5 w-2.5" />
                        <span>{item.tags[0]}</span>
                        {item.tags.length > 1 && (
                          <span className="text-[9px] text-slate-500">+{item.tags.length - 1}</span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Quick Copy Buttons for Logins / Cards */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    {item.type === 'login' && item.password && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopyText(item.password, 'Password');
                        }}
                        className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-indigo-300 transition"
                        title="Copy Password"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    )}
                    {item.type === 'login' && item.url && (
                      <a
                        href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-indigo-300 transition"
                        title="Open Website"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {item.type === 'card' && item.cardNumber && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopyText(item.cardNumber.replace(/\s+/g, ''), 'Card Number');
                        }}
                        className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-purple-300 transition"
                        title="Copy Card Number"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
