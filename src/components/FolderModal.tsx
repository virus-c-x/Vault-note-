import React, { useState, useEffect } from 'react';
import { Folder as FolderIcon, X, Check } from 'lucide-react';
import { generateUUID } from '../crypto/webCrypto';
import { Folder } from '../types';

interface FolderModalProps {
  isOpen: boolean;
  folderToEdit?: Folder | null;
  onClose: () => void;
  onSave: (folder: Folder) => void;
}

const COLOR_PALETTE = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f97316', // Orange
  '#eab308', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#64748b', // Slate
];

export const FolderModal: React.FC<FolderModalProps> = ({
  isOpen,
  folderToEdit,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLOR_PALETTE[0]);

  useEffect(() => {
    if (folderToEdit) {
      setName(folderToEdit.name);
      setColor(folderToEdit.color || COLOR_PALETTE[0]);
    } else {
      setName('');
      setColor(COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]);
    }
  }, [folderToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: folderToEdit?.id || generateUUID(),
      name: name.trim(),
      color: color,
      createdAt: folderToEdit?.createdAt || Date.now(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl p-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/10 p-6 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
            <FolderIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {folderToEdit ? 'Rename Folder' : 'New Folder'}
            </h2>
            <p className="text-xs text-slate-400">Organize your logins and notes</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Folder Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Work, Crypto, Travel, Finance"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition backdrop-blur-md"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Color Tag</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-7 w-7 rounded-full flex items-center justify-center transition hover:scale-110"
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="h-3.5 w-3.5 text-white drop-shadow-md" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition"
            >
              {folderToEdit ? 'Save Changes' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
