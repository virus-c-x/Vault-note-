import React, { useState, useEffect } from 'react';
import {
  Key,
  CreditCard,
  FileText,
  X,
  Sparkles,
  Eye,
  EyeOff,
  Folder as FolderIcon,
  Tag as TagIcon,
  Star,
  Plus,
} from 'lucide-react';
import { generatePassword, evaluatePasswordStrength } from '../crypto/passwordGenerator';
import { generateUUID } from '../crypto/webCrypto';
import { CardBrand, Folder, LoginItem, BankCardItem, SecureNoteItem, VaultItem, VaultItemType } from '../types';
import { PlatformSelector } from './PlatformSelector';
import { PlatformInfo } from '../data/platforms';

interface ItemModalProps {
  isOpen: boolean;
  itemToEdit?: VaultItem | null;
  initialType?: VaultItemType;
  folders: Folder[];
  currentFolderId?: string | null;
  onClose: () => void;
  onSave: (item: VaultItem) => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  itemToEdit,
  initialType = 'login',
  folders,
  currentFolderId = null,
  onClose,
  onSave,
}) => {
  const [type, setType] = useState<VaultItemType>(initialType);
  const [title, setTitle] = useState('');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Login fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Card fields
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardBrand, setCardBrand] = useState<CardBrand>('other');

  // Note fields
  const [content, setContent] = useState('');

  // Password Generator Popover State
  const [showGenPopover, setShowGenPopover] = useState(false);
  const [genLength, setGenLength] = useState(18);

  useEffect(() => {
    if (itemToEdit) {
      setType(itemToEdit.type);
      setTitle(itemToEdit.title);
      setFolderId(itemToEdit.folderId);
      setTags(itemToEdit.tags || []);
      setIsFavorite(itemToEdit.isFavorite || false);

      if (itemToEdit.type === 'login') {
        setUsername(itemToEdit.username || '');
        setPassword(itemToEdit.password || '');
        setUrl(itemToEdit.url || '');
        setNotes(itemToEdit.notes || '');
      } else if (itemToEdit.type === 'card') {
        setCardholderName(itemToEdit.cardholderName || '');
        setCardNumber(itemToEdit.cardNumber || '');
        setExpirationDate(itemToEdit.expirationDate || '');
        setCvv(itemToEdit.cvv || '');
        setCardBrand(itemToEdit.brand || 'other');
        setNotes(itemToEdit.notes || '');
      } else if (itemToEdit.type === 'note') {
        setContent(itemToEdit.content || '');
      }
    } else {
      setType(initialType);
      setTitle('');
      setFolderId(currentFolderId || null);
      setTags([]);
      setIsFavorite(false);
      setUsername('');
      setPassword('');
      setUrl('');
      setNotes('');
      setCardholderName('');
      setCardNumber('');
      setExpirationDate('');
      setCvv('');
      setCardBrand('other');
      setContent('');
    }
  }, [itemToEdit, initialType, currentFolderId, isOpen]);

  if (!isOpen) return null;

  // Auto detect card brand and format card number
  const handleCardNumberChange = (raw: string) => {
    const cleaned = raw.replace(/\D/g, '').slice(0, 19);
    // Format with spaces
    const parts = cleaned.match(/[\s\S]{1,4}/g) || [];
    const formatted = parts.join(' ');
    setCardNumber(formatted);

    // Brand detection
    if (/^4/.test(cleaned)) {
      setCardBrand('visa');
    } else if (/^(5[1-5]|2[2-7])/.test(cleaned)) {
      setCardBrand('mastercard');
    } else if (/^3[47]/.test(cleaned)) {
      setCardBrand('amex');
    } else if (/^6(011|5)/.test(cleaned)) {
      setCardBrand('discover');
    } else if (/^35/.test(cleaned)) {
      setCardBrand('jcb');
    } else {
      setCardBrand('other');
    }
  };

  const handleExpirationChange = (raw: string) => {
    const cleaned = raw.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      setExpirationDate(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setExpirationDate(cleaned);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const clean = tagInput.trim().replace(/^,+|,+$/g, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleGenerateInlinePassword = () => {
    const generated = generatePassword({
      mode: 'password',
      length: genLength,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeSimilar: true,
      wordCount: 4,
      separator: '-',
      capitalizeWords: true,
      includeNumberInPassphrase: false,
    });
    setPassword(generated);
    setShowPassword(true);
    setShowGenPopover(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const baseData = {
      id: itemToEdit?.id || generateUUID(),
      title: title.trim(),
      folderId: folderId || null,
      tags: tags,
      isFavorite: isFavorite,
      createdAt: itemToEdit?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    let itemToSave: VaultItem;

    if (type === 'login') {
      itemToSave = {
        ...baseData,
        type: 'login',
        username: username.trim(),
        password: password,
        url: url.trim(),
        notes: notes.trim(),
      };
    } else if (type === 'card') {
      itemToSave = {
        ...baseData,
        type: 'card',
        cardholderName: cardholderName.trim(),
        cardNumber: cardNumber.trim(),
        expirationDate: expirationDate.trim(),
        cvv: cvv.trim(),
        brand: cardBrand,
        notes: notes.trim(),
      };
    } else {
      itemToSave = {
        ...baseData,
        type: 'note',
        content: content,
      };
    }

    onSave(itemToSave);
    onClose();
  };

  const handleSelectPlatform = (platform: PlatformInfo) => {
    setTitle(platform.name);
    if (!url || url.startsWith('https://')) {
      setUrl(platform.defaultUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/10 p-6 sm:p-7 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h2 className="text-base sm:text-lg font-bold text-white">
            {itemToEdit ? `Edit ${itemToEdit.type === 'login' ? 'Login' : itemToEdit.type === 'card' ? 'Bank Card' : 'Secure Note'}` : 'New Vault Item'}
          </h2>
        </div>

        {/* Type Switcher (only for new item) */}
        {!itemToEdit && (
          <div className="grid grid-cols-3 gap-2 mt-4 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setType('login')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition ${
                type === 'login'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Key className="h-3.5 w-3.5" />
              <span>Login</span>
            </button>
            <button
              type="button"
              onClick={() => setType('card')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition ${
                type === 'card'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Bank Card</span>
            </button>
            <button
              type="button"
              onClick={() => setType('note')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition ${
                type === 'note'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Secure Note</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Common Title & Favorite */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Title / Name *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  type === 'login'
                    ? 'e.g., GitHub, Google Account'
                    : type === 'card'
                    ? 'e.g., Chase Sapphire, Debit Card'
                    : 'e.g., Recovery Keys, WiFi Password'
                }
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition backdrop-blur-md"
                required
                autoFocus
              />
            </div>

            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`mt-5 p-2.5 rounded-xl border backdrop-blur-md transition ${
                isFavorite
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title={isFavorite ? 'Starred as favorite' : 'Mark as favorite'}
            >
              <Star className={`h-5 w-5 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
          </div>

          {/* LOGIN SPECIFIC FIELDS */}
          {type === 'login' && (
            <div className="space-y-4">
              {!itemToEdit && (
                <PlatformSelector
                  selectedTitle={title}
                  onSelectPlatform={handleSelectPlatform}
                />
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Username or Email
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g., user@example.com"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition font-mono backdrop-blur-md"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowGenPopover(!showGenPopover)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition"
                  >
                    <Sparkles className="h-3 w-3" />
                    Generate Strong Password
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter or generate password"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 pr-10 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition backdrop-blur-md"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Inline Generator Popover */}
                {showGenPopover && (
                  <div className="mt-2 p-3.5 rounded-2xl bg-black/40 border border-indigo-500/40 backdrop-blur-xl shadow-xl space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">
                        Generator Length: <strong className="text-white font-mono">{genLength}</strong>
                      </span>
                      <input
                        type="range"
                        min="8"
                        max="36"
                        value={genLength}
                        onChange={(e) => setGenLength(Number(e.target.value))}
                        className="w-32 accent-indigo-500 cursor-pointer"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateInlinePassword}
                      className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition"
                    >
                      Generate & Insert Password
                    </button>
                  </div>
                )}

                {password && (
                  <div className="mt-1.5 text-[11px] text-slate-400 font-mono">
                    Strength: <strong className="text-slate-200">{evaluatePasswordStrength(password).label}</strong>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Website URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g., https://github.com/login"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition font-mono backdrop-blur-md"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Security questions, PINs, or additional details..."
                  rows={3}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none leading-relaxed backdrop-blur-md"
                />
              </div>
            </div>
          )}

          {/* CARD SPECIFIC FIELDS */}
          {type === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="Name as it appears on card"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm uppercase text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition backdrop-blur-md"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Card Number</label>
                  <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold">
                    {cardBrand.toUpperCase()}
                  </span>
                </div>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  placeholder="4000 1234 5678 9010"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition tracking-wider backdrop-blur-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Expiration Date (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={expirationDate}
                    onChange={(e) => handleExpirationChange(e.target.value)}
                    placeholder="12/28"
                    maxLength={5}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition backdrop-blur-md"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Security Code (CVV)
                  </label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.slice(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition backdrop-blur-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Bank customer service phone, billing address..."
                  rows={2}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none leading-relaxed backdrop-blur-md"
                />
              </div>
            </div>
          )}

          {/* NOTE SPECIFIC FIELDS */}
          {type === 'note' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Note Content *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your secret notes, recovery phrases, server keys, or documentation..."
                  rows={8}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition resize-y leading-relaxed backdrop-blur-md"
                  required
                />
              </div>
            </div>
          )}

          {/* Folder Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Folder / Category
            </label>
            <div className="relative">
              <select
                value={folderId || ''}
                onChange={(e) => setFolderId(e.target.value || null)}
                className="w-full appearance-none rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 pr-8 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition cursor-pointer backdrop-blur-md"
              >
                <option value="" className="bg-[#0e0e12] text-white">(No folder)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id} className="bg-[#0e0e12] text-white">
                    {f.name}
                  </option>
                ))}
              </select>
              <FolderIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            </div>
          </div>

          {/* Tags Editor */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tags</label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-white/5 border border-white/10 min-h-[42px] backdrop-blur-md">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 px-2 py-1 text-xs text-indigo-300 font-medium"
                >
                  <TagIcon className="h-3 w-3" />
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}

              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? 'Type tag and press Enter...' : 'Add tag...'}
                className="flex-1 min-w-[120px] bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none px-1"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition"
            >
              {itemToEdit ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
