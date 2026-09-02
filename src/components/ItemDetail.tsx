import React, { useState } from 'react';
import {
  Key,
  CreditCard,
  FileText,
  Star,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Tag as TagIcon,
  Folder as FolderIcon,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { evaluatePasswordStrength } from '../crypto/passwordGenerator';
import { Folder, VaultItem } from '../types';

interface ItemDetailProps {
  item: VaultItem | null;
  folders: Folder[];
  onEditItem: (item: VaultItem) => void;
  onDeleteItem: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onCopyText: (text: string, label: string) => void;
  onCloseMobileDetail?: () => void;
}

export const ItemDetail: React.FC<ItemDetailProps> = ({
  item,
  folders,
  onEditItem,
  onDeleteItem,
  onToggleFavorite,
  onCopyText,
  onCloseMobileDetail,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!item) {
    return (
      <div className="hidden lg:flex h-full w-full flex-col items-center justify-center p-8 text-center bg-transparent">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/5 border border-white/10 text-slate-500 mb-4 shadow-xl backdrop-blur-md">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h3 className="text-base font-bold text-slate-200">No Item Selected</h3>
        <p className="mt-1.5 text-xs text-slate-400 max-w-sm leading-relaxed">
          Select an account, card, or note from the left list to view decrypted sensitive details.
        </p>
      </div>
    );
  }

  const folder = folders.find((f) => f.id === item.folderId);

  const handleCopy = (text: string, label: string, fieldKey: string) => {
    onCopyText(text, label);
    setCopiedField(fieldKey);
    setTimeout(() => {
      setCopiedField((prev) => (prev === fieldKey ? null : prev));
    }, 2000);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCardBrandGradient = (brand?: string) => {
    switch (brand) {
      case 'visa':
        return 'from-blue-950/80 via-indigo-950/60 to-slate-950/90 border-blue-500/30';
      case 'mastercard':
        return 'from-stone-950/80 via-red-950/60 to-slate-950/90 border-orange-500/30';
      case 'amex':
        return 'from-emerald-950/80 via-teal-950/60 to-slate-950/90 border-emerald-500/30';
      default:
        return 'from-slate-900/80 via-indigo-950/40 to-slate-950/90 border-white/10';
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-white/[0.01] backdrop-blur-2xl overflow-y-auto">
      {/* Top Detail Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-md px-6 py-4">
        <div className="flex items-center gap-3 min-w-0">
          {onCloseMobileDetail && (
            <button
              onClick={onCloseMobileDetail}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
            >
              Back
            </button>
          )}

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-sm backdrop-blur-md">
            {item.type === 'login' && <Key className="h-5 w-5 text-indigo-400" />}
            {item.type === 'card' && <CreditCard className="h-5 w-5 text-purple-400" />}
            {item.type === 'note' && <FileText className="h-5 w-5 text-amber-400" />}
          </div>

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white truncate">
              {item.title}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                {item.type === 'login' ? 'Login' : item.type === 'card' ? 'Bank Card' : 'Secure Note'}
              </span>
              {folder && (
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: folder.color }}
                  />
                  <span>{folder.name}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Top Right Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleFavorite(item.id)}
            className={`p-2 rounded-xl border backdrop-blur-md transition ${
              item.isFavorite
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                : 'border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title={item.isFavorite ? 'Remove from favorites' : 'Favorite'}
          >
            <Star className={`h-4 w-4 ${item.isFavorite ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={() => onEditItem(item)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white backdrop-blur-md transition"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>

          <button
            onClick={() => onDeleteItem(item.id)}
            className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 backdrop-blur-md transition"
            title="Delete Item"
          >
            <Trash2 className="h-4 w-4 text-rose-400" />
          </button>
        </div>
      </div>

      {/* Detail Content Body */}
      <div className="flex-1 p-6 space-y-6 max-w-4xl">
        {/* LOGIN ITEM VIEW */}
        {item.type === 'login' && (
          <div className="space-y-4">
            {/* Username / Email */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 shadow-sm backdrop-blur-md">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Username / Email
              </label>
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-sm text-slate-100 select-all truncate">
                  {item.username || <span className="text-slate-500 italic">No username provided</span>}
                </span>
                {item.username && (
                  <button
                    onClick={() => handleCopy(item.username, 'Username', 'user')}
                    className="flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white transition shrink-0"
                  >
                    {copiedField === 'user' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 shadow-sm backdrop-blur-md">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                {item.password && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    {item.password.length} chars • {evaluatePasswordStrength(item.password).label}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="font-mono text-sm text-slate-100 select-all tracking-wider truncate">
                  {item.password ? (
                    showPassword ? item.password : '••••••••••••••••'
                  ) : (
                    <span className="text-slate-500 italic">No password</span>
                  )}
                </div>

                {item.password && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>

                    <button
                      onClick={() => handleCopy(item.password, 'Password', 'pass')}
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition"
                    >
                      {copiedField === 'pass' ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Website URL */}
            {item.url && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 shadow-sm backdrop-blur-md">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Website URL
                </label>
                <div className="flex items-center justify-between gap-3">
                  <a
                    href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-indigo-400 hover:underline truncate"
                  >
                    {item.url}
                  </a>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopy(item.url, 'URL', 'url')}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
                      title="Copy URL"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <a
                      href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Launch</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {item.notes && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 shadow-sm backdrop-blur-md">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Encrypted Notes
                </label>
                <div className="whitespace-pre-wrap font-sans text-xs text-slate-300 leading-relaxed bg-black/30 rounded-xl p-3.5 border border-white/10">
                  {item.notes}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BANK CARD ITEM VIEW */}
        {item.type === 'card' && (
          <div className="space-y-6">
            {/* Visual Bank Card Graphic */}
            <div
              className={`relative w-full max-w-md rounded-3xl border p-6 sm:p-7 shadow-2xl bg-gradient-to-br ${getCardBrandGradient(
                item.brand
              )} text-white overflow-hidden backdrop-blur-2xl`}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-10 rounded-md bg-amber-400/80 border border-amber-300/60 shadow-inner flex items-center justify-center">
                    <div className="h-3 w-4 border border-amber-600/40 rounded-xs" />
                  </div>
                  <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                    Secure Chip
                  </span>
                </div>
                <span className="text-sm font-extrabold uppercase tracking-wider font-mono text-slate-200">
                  {item.brand || 'CARD'}
                </span>
              </div>

              {/* Card Number */}
              <div className="mb-6">
                <div className="font-mono text-lg sm:text-xl font-bold tracking-widest text-slate-100 select-all">
                  {showCardNumber
                    ? item.cardNumber || '•••• •••• •••• ••••'
                    : item.cardNumber
                    ? `•••• •••• •••• ${item.cardNumber.slice(-4)}`
                    : '•••• •••• •••• ••••'}
                </div>
              </div>

              {/* Card Holder & Expiry */}
              <div className="flex items-end justify-between text-xs font-mono">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400">
                    Cardholder
                  </span>
                  <span className="font-semibold text-slate-100 uppercase tracking-wider">
                    {item.cardholderName || 'VALUED CARDHOLDER'}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400">
                    Expires
                  </span>
                  <span className="font-semibold text-slate-100">
                    {item.expirationDate || 'MM/YY'}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400">
                    CVV
                  </span>
                  <span className="font-semibold text-slate-100">
                    {showCvv ? item.cvv || '•••' : '•••'}
                  </span>
                </div>
              </div>
            </div>

            {/* Field Controls for Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Card Number
                </label>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-200">
                    {showCardNumber ? item.cardNumber : `•••• •••• •••• ${item.cardNumber?.slice(-4)}`}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowCardNumber(!showCardNumber)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                    >
                      {showCardNumber ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() =>
                        handleCopy(
                          (item.cardNumber || '').replace(/\s+/g, ''),
                          'Card Number',
                          'cardnum'
                        )
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-white/10"
                      title="Copy Card Number"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Security Code (CVV)
                </label>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-200">
                    {showCvv ? item.cvv : '•••'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowCvv(!showCvv)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                    >
                      {showCvv ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => handleCopy(item.cvv || '', 'CVV', 'cvv')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-white/10"
                      title="Copy CVV"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {item.notes && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 shadow-sm backdrop-blur-md">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Encrypted Notes
                </label>
                <div className="whitespace-pre-wrap font-sans text-xs text-slate-300 leading-relaxed bg-black/30 rounded-xl p-3.5 border border-white/10">
                  {item.notes}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECURE NOTE ITEM VIEW */}
        {item.type === 'note' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                {item.content.length} characters • {item.content.trim() ? item.content.trim().split(/\s+/).length : 0} words
              </span>
              <button
                onClick={() => handleCopy(item.content, 'Note Content', 'note')}
                className="flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white backdrop-blur-md transition"
              >
                {copiedField === 'note' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Note</span>
                  </>
                )}
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm min-h-[260px] backdrop-blur-md">
              <div className="whitespace-pre-wrap font-mono text-xs text-slate-200 leading-relaxed select-all">
                {item.content || <span className="text-slate-500 italic">This note is empty.</span>}
              </div>
            </div>
          </div>
        )}

        {/* Tags List */}
        {item.tags && item.tags.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 px-2.5 py-1 text-xs text-slate-300 font-medium"
                >
                  <TagIcon className="h-3 w-3 text-indigo-400" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Timestamps */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/10 text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Created: {formatDate(item.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Last Updated: {formatDate(item.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
};
