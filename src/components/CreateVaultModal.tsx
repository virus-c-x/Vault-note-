import React, { useState } from 'react';
import { Shield, Eye, EyeOff, KeyRound, AlertTriangle, Sparkles, X } from 'lucide-react';
import { evaluatePasswordStrength, generatePassword } from '../crypto/passwordGenerator';
import { createDefaultVault } from '../crypto/webCrypto';
import { DecryptedVault } from '../types';

interface CreateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (vault: DecryptedVault, masterPassword: string) => Promise<void>;
}

export const CreateVaultModal: React.FC<CreateVaultModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [vaultName, setVaultName] = useState('Personal Vault');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [includeSamples, setIncludeSamples] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const strength = evaluatePasswordStrength(password);

  const handleGenerateStrong = () => {
    const generated = generatePassword({
      mode: 'passphrase',
      length: 18,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeSimilar: true,
      wordCount: 4,
      separator: '-',
      capitalizeWords: true,
      includeNumberInPassphrase: true,
    });
    setPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Master Password must be at least 8 characters long (14+ recommended).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Master Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const vault = createDefaultVault(vaultName.trim() || 'Personal Vault');

      if (includeSamples) {
        const personalFolder = vault.folders[0]?.id || null;
        const workFolder = vault.folders[1]?.id || null;

        vault.items.push(
          {
            id: 'sample-login-github',
            type: 'login',
            title: 'GitHub',
            username: 'developer@example.com',
            password: 'ghp_sampleSecretTokenPass123!#',
            url: 'https://github.com',
            notes: 'Personal open source development profile & ssh key backup.',
            folderId: personalFolder,
            tags: ['dev', 'git'],
            isFavorite: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: 'sample-card-main',
            type: 'card',
            title: 'Zero-Fee Debit Card',
            cardholderName: 'VAULT HOLDER',
            cardNumber: '4242 4242 4242 4242',
            expirationDate: '12/29',
            cvv: '987',
            brand: 'visa',
            notes: 'Primary contactless debit card for online purchases.',
            folderId: personalFolder,
            tags: ['finance', 'banking'],
            isFavorite: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: 'sample-note-seed',
            type: 'note',
            title: 'Welcome to Vault Note',
            content: `## Welcome to Vault Note 🛡️

Vault Note is your private, zero-knowledge security vault.

### Key Guarantees:
- **AES-256-GCM Authenticated Encryption**: Your records are encrypted right in your browser before ever touching storage.
- **PBKDF2 with 600,000 Iterations**: Strong resistance against brute-force attacks.
- **100% Client-Side**: No cloud servers, no databases, no tracking.
- **Offline & PWA Ready**: Install on iOS, Android, macOS, Windows, and Linux.

### Important:
**If you forget your Master Password, your encrypted data cannot be recovered.** Remember to periodically export your \`.vault\` backup file from the sidebar menu!`,
            folderId: workFolder,
            tags: ['security', 'guide'],
            isFavorite: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
        );
      }

      await onCreate(vault, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create vault.');
      setIsSubmitting(false);
    }
  };

  const getStrengthBarColor = (score: number) => {
    switch (score) {
      case 0:
        return 'bg-rose-500';
      case 1:
        return 'bg-orange-500';
      case 2:
        return 'bg-amber-500';
      case 3:
        return 'bg-emerald-500';
      case 4:
        return 'bg-indigo-400';
      default:
        return 'bg-zinc-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Create New Encrypted Vault</h2>
            <p className="text-xs text-slate-400">Zero-knowledge, browser-local AES-256-GCM encryption</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-300 backdrop-blur-md">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Vault Name</label>
            <input
              type="text"
              value={vaultName}
              onChange={(e) => setVaultName(e.target.value)}
              placeholder="e.g., Personal Vault"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition backdrop-blur-md"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Master Password</label>
              <button
                type="button"
                onClick={handleGenerateStrong}
                className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition"
              >
                <Sparkles className="h-3 w-3" />
                Suggest Strong Passphrase
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a strong, memorable Master Password"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 pr-10 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition backdrop-blur-md"
                required
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

            {/* Password strength meter */}
            {password.length > 0 && (
              <div className="mt-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    Strength: <strong className="text-slate-200">{strength.label}</strong> ({strength.entropyBits} bits entropy)
                  </span>
                  <span className="text-slate-400">Crack time: {strength.crackTimeDisplay}</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full">
                  {[0, 1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`rounded-full transition-all duration-300 ${
                        level <= strength.score ? getStrengthBarColor(strength.score) : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Master Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your Master Password exactly"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition backdrop-blur-md"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeSamples}
                onChange={(e) => setIncludeSamples(e.target.checked)}
                className="rounded bg-white/5 border-white/20 text-indigo-600 focus:ring-indigo-500/20"
              />
              <span className="text-xs text-slate-300">Populate with helpful starter categories and guides</span>
            </label>
          </div>

          {/* Critical Warning Box */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200/90 leading-relaxed backdrop-blur-md">
            <div className="font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
              Important Warning:
            </div>
            If you forget your Master Password, your encrypted data cannot be recovered. Vault Note has zero backdoors, no reset emails, and no recovery servers.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || password.length === 0}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <KeyRound className="h-4 w-4" />
              {isSubmitting ? 'Encrypting & Initializing...' : 'Create & Encrypt Vault'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
