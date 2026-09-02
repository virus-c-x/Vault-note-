import React, { useState, useRef } from 'react';
import {
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Upload,
  PlusCircle,
  Lock,
  AlertTriangle,
  FileKey2,
  Trash2,
  CheckCircle2,
  HardDriveDownload,
  Loader2,
  Fingerprint,
} from 'lucide-react';
import { parseVaultFileContent } from '../storage/vaultSerializer';
import { EncryptedVaultPayload } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { isBiometricEnabledLocally, authenticateWithBiometrics } from '../crypto/biometric';

interface UnlockScreenProps {
  hasExistingVault: boolean;
  onUnlock: (password: string) => Promise<void>;
  onCreateNewClick: () => void;
  onImportVaultPayload: (payload: EncryptedVaultPayload, passwordPrompt?: string) => Promise<void>;
  onResetVault: () => Promise<void>;
}

export const UnlockScreen: React.FC<UnlockScreenProps> = ({
  hasExistingVault,
  onUnlock,
  onCreateNewClick,
  onImportVaultPayload,
  onResetVault,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(isBiometricEnabledLocally());
  const [isBiometricAuthenticating, setIsBiometricAuthenticating] = useState(false);

  // For imported file pending unlock
  const [importedPayload, setImportedPayload] = useState<EncryptedVaultPayload | null>(null);
  const [importFileName, setImportFileName] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBiometricUnlock = async () => {
    setErrorMessage(null);
    setIsBiometricAuthenticating(true);
    try {
      const recoveredPassword = await authenticateWithBiometrics();
      await onUnlock(recoveredPassword);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Biometric verification failed.');
    } finally {
      setIsBiometricAuthenticating(false);
    }
  };

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setErrorMessage(null);
    setIsUnlocking(true);

    try {
      if (importedPayload) {
        // Unlock newly imported payload
        await onImportVaultPayload(importedPayload, password);
      } else {
        // Unlock existing local vault
        await onUnlock(password);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Incorrect Master Password.');
      setIsUnlocking(false);
    }
  };

  const handleFileProcess = (file: File) => {
    setErrorMessage(null);
    if (!file.name.endsWith('.vault') && !file.name.endsWith('.json')) {
      setErrorMessage('Please select a valid .vault file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const payload = parseVaultFileContent(content);
        setImportedPayload(payload);
        setImportFileName(file.name);
        setPassword('');
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Invalid vault file structure.');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className="min-h-screen w-full flex flex-col justify-between bg-[#0a0a0c] text-slate-100 p-4 sm:p-6 lg:p-8 relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-600/25 text-white font-bold">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white">Vault Note</span>
            <span className="ml-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
              Zero Knowledge
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PWAInstallButton />
        </div>
      </div>

      {/* Center Unlock Box */}
      <div className="w-full max-w-md mx-auto my-auto z-10 py-8">
        <div className="rounded-3xl bg-[#0a0a0c]/80 border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
          {/* Header Icon */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner text-indigo-400 mb-3.5 backdrop-blur-md">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {importedPayload ? 'Unlock Imported Vault' : hasExistingVault ? 'Unlock Your Vault' : 'Welcome to Vault Note'}
            </h1>
            <p className="mt-1 text-xs text-slate-400 max-w-xs leading-relaxed">
              {importedPayload
                ? `Loaded "${importFileName}". Enter master password to decrypt.`
                : hasExistingVault
                ? 'Enter your Master Password to decrypt your local vault.'
                : 'Create an encrypted vault or import an existing .vault file.'}
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-300 backdrop-blur-md">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Unlock Form */}
          {(hasExistingVault || importedPayload) ? (
            <form onSubmit={handleUnlockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Master Password..."
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-3 pr-10 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-inner backdrop-blur-md"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUnlocking || !password}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 py-3 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isUnlocking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Deriving Key & Decrypting...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    <span>Unlock Vault</span>
                  </>
                )}
              </button>

              {/* Biometric Quick Unlock Option */}
              {hasExistingVault && !importedPayload && isBiometricEnabled && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleBiometricUnlock}
                    disabled={isBiometricAuthenticating}
                    className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 hover:border-indigo-500/50 py-2.5 px-4 text-xs font-semibold text-indigo-300 transition backdrop-blur-md"
                  >
                    {isBiometricAuthenticating ? (
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                    ) : (
                      <Fingerprint className="h-4 w-4 text-indigo-400" />
                    )}
                    <span>{isBiometricAuthenticating ? 'Verifying Biometrics...' : 'Quick Unlock with Biometrics'}</span>
                  </button>
                </div>
              )}

              {importedPayload && (
                <button
                  type="button"
                  onClick={() => {
                    setImportedPayload(null);
                    setImportFileName('');
                    setPassword('');
                  }}
                  className="w-full text-center text-xs text-slate-400 hover:text-white py-1 transition"
                >
                  Cancel file import
                </button>
              )}
            </form>
          ) : (
            /* First time: No local vault */
            <div className="space-y-3">
              <button
                onClick={onCreateNewClick}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3.5 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create New Vault</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 py-3.5 px-4 text-sm font-medium text-slate-200 transition backdrop-blur-md"
              >
                <Upload className="h-4 w-4 text-indigo-400" />
                <span>Open / Import .vault File</span>
              </button>
            </div>
          )}

          {/* Secondary Actions for Existing Vault */}
          {hasExistingVault && !importedPayload && (
            <div className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Import .vault file</span>
                </button>

                <button
                  onClick={onCreateNewClick}
                  className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>New Vault</span>
                </button>
              </div>

              <div className="text-center mt-2">
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="text-[11px] text-slate-500 hover:text-rose-400 transition"
                >
                  Reset local storage
                </button>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".vault,.json"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Drag and Drop notice */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`mt-4 rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition backdrop-blur-md ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-500/15 text-indigo-200'
              : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-300'
          }`}
        >
          <div className="flex items-center justify-center gap-2 text-xs font-medium">
            <FileKey2 className="h-4 w-4" />
            <span>Drop encrypted .vault file here to open</span>
          </div>
        </div>

        {/* Recovery Warning */}
        <p className="mt-4 text-center text-[11px] text-slate-500 leading-relaxed">
          “If you forget your Master Password, your encrypted data cannot be recovered.”
        </p>
      </div>

      {/* Bottom Security Architecture Badges */}
      <div className="w-full max-w-5xl mx-auto z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          AES-256-GCM Encryption
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
          PBKDF2 SHA-256 (600,000 Rounds)
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          100% Client-Side / Zero-Knowledge
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
          No Server / No Tracking
        </span>
      </div>

      {/* Reset Vault Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#0a0a0c]/90 border border-white/10 p-6 shadow-2xl text-slate-100 backdrop-blur-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Reset Local Storage?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              This will remove the locally stored encrypted vault from this browser. Ensure you have an exported <strong className="text-white">.vault</strong> backup file if you wish to keep your data.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onResetVault();
                  setShowResetConfirm(false);
                  setPassword('');
                }}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-600/20"
              >
                Wipe Local Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
