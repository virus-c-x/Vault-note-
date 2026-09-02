import React, { useState } from 'react';
import {
  Settings,
  KeyRound,
  Clock,
  Shield,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Fingerprint,
} from 'lucide-react';
import { evaluatePasswordStrength, generatePassword } from '../crypto/passwordGenerator';
import { DecryptedVault } from '../types';
import {
  isBiometricAvailable,
  isBiometricEnabledLocally,
  setupBiometricQuickUnlock,
  disableBiometricQuickUnlock,
} from '../crypto/biometric';

interface SettingsModalProps {
  isOpen: boolean;
  vault: DecryptedVault | null;
  onClose: () => void;
  onChangeMasterPassword: (oldPass: string, newPass: string) => Promise<void>;
  onUpdateVaultSettings: (updatedVault: DecryptedVault) => Promise<void>;
  onWipeVault: () => Promise<void>;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  vault,
  onClose,
  onChangeMasterPassword,
  onUpdateVaultSettings,
  onWipeVault,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'password' | 'security' | 'danger'>('general');

  // General settings state
  const [vaultName, setVaultName] = useState(vault?.name || 'Personal Vault');
  const [autoLockMinutes, setAutoLockMinutes] = useState(
    vault?.settings?.autoLockMinutes !== undefined ? vault.settings.autoLockMinutes : 15
  );
  const [clipboardClearSeconds, setClipboardClearSeconds] = useState(
    vault?.settings?.clipboardClearSeconds !== undefined ? vault.settings.clipboardClearSeconds : 30
  );

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);

  // Wipe confirmation modal state
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  // Biometric state
  const [bioSupported, setBioSupported] = useState<boolean | null>(null);
  const [bioEnabled, setBioEnabled] = useState(isBiometricEnabledLocally());
  const [bioPrompting, setBioPrompting] = useState(false);
  const [bioMasterPass, setBioMasterPass] = useState('');
  const [bioLoading, setBioLoading] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);

  React.useEffect(() => {
    isBiometricAvailable().then((supported) => {
      setBioSupported(supported);
    });
  }, []);

  const handleEnableBiometric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bioMasterPass) return;
    setBioLoading(true);
    setBioError(null);
    try {
      await setupBiometricQuickUnlock(bioMasterPass);
      setBioEnabled(true);
      setBioPrompting(false);
      setBioMasterPass('');
      onShowToast('Biometric Quick Unlock enabled for this device!', 'success');
    } catch (err: unknown) {
      setBioError(err instanceof Error ? err.message : 'Biometric setup failed.');
    } finally {
      setBioLoading(false);
    }
  };

  const handleDisableBiometric = () => {
    disableBiometricQuickUnlock();
    setBioEnabled(false);
    setBioPrompting(false);
    onShowToast('Biometric Quick Unlock disabled.', 'info');
  };

  if (!isOpen || !vault) return null;

  const newStrength = evaluatePasswordStrength(newPassword);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated: DecryptedVault = {
        ...vault,
        name: vaultName.trim() || 'Personal Vault',
        settings: {
          ...vault.settings,
          autoLockMinutes,
          clipboardClearSeconds,
        },
      };
      await onUpdateVaultSettings(updated);
      onShowToast('Vault settings updated successfully.', 'success');
    } catch {
      onShowToast('Failed to update settings.', 'error');
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);

    if (newPassword.length < 8) {
      setPassError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    try {
      setIsChangingPass(true);
      await onChangeMasterPassword(oldPassword, newPassword);
      onShowToast('Master Password successfully changed and vault re-encrypted!', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setActiveTab('general');
    } catch (err: unknown) {
      setPassError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setIsChangingPass(false);
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

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Vault Settings</h2>
            <p className="text-xs text-slate-400">Manage security preferences and master credentials</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-4 gap-1.5 mt-4 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === 'general' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === 'password' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === 'security' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('danger')}
            className={`py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === 'danger' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Danger
          </button>
        </div>

        {/* TAB 1: GENERAL */}
        {activeTab === 'general' && (
          <form onSubmit={handleSaveGeneral} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Vault Name
              </label>
              <input
                type="text"
                value={vaultName}
                onChange={(e) => setVaultName(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition backdrop-blur-md"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Inactivity Auto-Lock Timeout
              </label>
              <select
                value={autoLockMinutes}
                onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer backdrop-blur-md"
              >
                <option value={1} className="bg-[#0e0e12] text-white">1 Minute</option>
                <option value={5} className="bg-[#0e0e12] text-white">5 Minutes</option>
                <option value={15} className="bg-[#0e0e12] text-white">15 Minutes (Recommended)</option>
                <option value={30} className="bg-[#0e0e12] text-white">30 Minutes</option>
                <option value={60} className="bg-[#0e0e12] text-white">1 Hour</option>
                <option value={0} className="bg-[#0e0e12] text-white">Never Auto-Lock (Not Recommended)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Clipboard Auto-Clear Timer
              </label>
              <select
                value={clipboardClearSeconds}
                onChange={(e) => setClipboardClearSeconds(Number(e.target.value))}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer backdrop-blur-md"
              >
                <option value={15} className="bg-[#0e0e12] text-white">15 Seconds</option>
                <option value={30} className="bg-[#0e0e12] text-white">30 Seconds (Recommended)</option>
                <option value={60} className="bg-[#0e0e12] text-white">60 Seconds</option>
                <option value={0} className="bg-[#0e0e12] text-white">Disabled</option>
              </select>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition"
              >
                Save Preferences
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: CHANGE PASSWORD */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePasswordSubmit} className="mt-5 space-y-4">
            {passError && (
              <div className="flex items-start gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300 backdrop-blur-md">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{passError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Current Master Password
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password..."
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition backdrop-blur-md"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">New Master Password</label>
                <button
                  type="button"
                  onClick={() => {
                    const generated = generatePassword({
                      mode: 'passphrase',
                      length: 20,
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
                    setNewPassword(generated);
                    setConfirmNewPassword(generated);
                    setShowPassword(true);
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  <Sparkles className="h-3 w-3" />
                  Suggest Strong Passphrase
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter strong new master password..."
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 pr-10 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition backdrop-blur-md"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {newPassword && (
                <div className="mt-2 text-[11px] text-slate-400">
                  Strength: <strong className="text-slate-200">{newStrength.label}</strong> ({newStrength.entropyBits} bits entropy)
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm New Master Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Repeat new password..."
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition backdrop-blur-md"
                required
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                type="submit"
                disabled={isChangingPass}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition"
              >
                <KeyRound className="h-4 w-4" />
                <span>{isChangingPass ? 'Re-encrypting Vault...' : 'Update Master Password'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: SECURITY SPECS & BIOMETRICS */}
        {activeTab === 'security' && (
          <div className="mt-5 space-y-4">
            {/* Biometric Quick Unlock Control */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                  <Fingerprint className="h-4 w-4" />
                  <span>Biometric Quick Unlock</span>
                </div>
                {bioEnabled && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Active on this device
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Biometric authentication provides optional, same-device quick unlocking via Touch ID, Face ID, or Windows Hello.
                <strong className="text-white block mt-1">
                  The Master Password is never replaced and remains the sole cryptographic root required for vault recovery and multi-device access.
                </strong>
              </p>

              {bioSupported === false && (
                <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                  Biometric hardware authentication is not supported or permitted on this browser/platform.
                </div>
              )}

              {bioSupported && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  {bioEnabled ? (
                    <button
                      type="button"
                      onClick={handleDisableBiometric}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition"
                    >
                      Disable Biometric Quick Unlock
                    </button>
                  ) : bioPrompting ? (
                    <form onSubmit={handleEnableBiometric} className="space-y-3">
                      {bioError && (
                        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                          {bioError}
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Confirm Master Password to bind biometrics
                        </label>
                        <input
                          type="password"
                          value={bioMasterPass}
                          onChange={(e) => setBioMasterPass(e.target.value)}
                          placeholder="Enter Master Password..."
                          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          required
                          autoFocus
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          disabled={bioLoading || !bioMasterPass}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 disabled:opacity-50 transition"
                        >
                          {bioLoading ? 'Registering Biometrics...' : 'Authenticate & Enable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBioPrompting(false);
                            setBioMasterPass('');
                            setBioError(null);
                          }}
                          className="px-3 py-2 rounded-xl bg-white/5 text-slate-400 hover:text-white text-xs transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setBioPrompting(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition"
                    >
                      <Fingerprint className="h-4 w-4" />
                      <span>Enable Biometric Quick Unlock</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-1">
                <Shield className="h-4 w-4" />
                <span>Cryptographic Architecture Specifications</span>
              </div>
              <p className="text-xs text-indigo-200/80 leading-relaxed">
                Vault Note is engineered with zero-knowledge primitives backed directly by the browser's hardware-accelerated Web Cryptography API.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 divide-y divide-white/5 text-xs backdrop-blur-md">
              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Symmetric Cipher</span>
                <span className="font-mono text-emerald-400 font-semibold">AES-256-GCM (128-bit Auth Tag)</span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Key Derivation</span>
                <span className="font-mono text-indigo-300 font-semibold">PBKDF2 SHA-256 (600,000 Rounds)</span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Salt & IV Entropy</span>
                <span className="font-mono text-slate-300">128-bit Salt, 96-bit Random IV</span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Persistence Engine</span>
                <span className="font-mono text-slate-300">IndexedDB (Zero plaintext on disk)</span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Cloud Server Usage</span>
                <span className="font-mono text-emerald-400 font-semibold">None (0 bytes outbound)</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DANGER ZONE */}
        {activeTab === 'danger' && (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span>Danger: Permanent Data Deletion</span>
              </div>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                Wiping your vault completely purges all encrypted local records and stored keys from your browser's IndexedDB. Ensure you have downloaded a <strong className="text-white">.vault</strong> backup file first if you want to keep your data.
              </p>
            </div>

            <button
              onClick={() => setShowWipeConfirm(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 py-3 px-4 text-xs font-semibold text-white shadow-lg shadow-rose-600/25 transition"
            >
              <Trash2 className="h-4 w-4" />
              <span>Wipe & Reset Entire Vault</span>
            </button>
          </div>
        )}
      </div>

      {/* Wipe Confirmation Dialog */}
      {showWipeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#0a0a0c]/90 border border-white/10 p-6 shadow-2xl text-slate-100 backdrop-blur-2xl">
            <h3 className="text-base font-bold text-rose-400 mb-2">Are you completely sure?</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              All stored passwords, cards, and secure notes will be permanently destroyed from this device.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowWipeConfirm(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onWipeVault();
                  setShowWipeConfirm(false);
                  onClose();
                }}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-600/20"
              >
                Yes, Wipe Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
