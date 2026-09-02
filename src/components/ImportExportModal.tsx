import React, { useState, useRef } from 'react';
import {
  ArrowDownUp,
  Download,
  Upload,
  FileCode,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  X,
  FileText,
  Shield,
  Loader2,
} from 'lucide-react';
import { parseCsvToVaultItems } from '../storage/csvParser';
import {
  downloadDecryptedExport,
  downloadEncryptedVaultFile,
  parseVaultFileContent,
} from '../storage/vaultSerializer';
import { DecryptedVault, EncryptedVaultPayload, Folder, VaultItem } from '../types';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  vault: DecryptedVault | null;
  encryptedPayload: EncryptedVaultPayload | null;
  folders: Folder[];
  onImportCsvItems: (items: VaultItem[], folderId: string | null) => void;
  onImportVaultFile: (payload: EncryptedVaultPayload, mode: 'replace' | 'merge') => Promise<void>;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  vault,
  encryptedPayload,
  folders,
  onImportCsvItems,
  onImportVaultFile,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'export-vault' | 'import-vault' | 'import-csv' | 'export-plain'>('export-vault');

  // CSV Import State
  const [csvPreviewItems, setCsvPreviewItems] = useState<VaultItem[]>([]);
  const [csvFileName, setCsvFileName] = useState('');
  const [csvTargetFolderId, setCsvTargetFolderId] = useState<string | null>(null);
  const [isParsingCsv, setIsParsingCsv] = useState(false);

  // Vault File Import State
  const [importedVaultPayload, setImportedVaultPayload] = useState<EncryptedVaultPayload | null>(null);
  const [vaultFileName, setVaultFileName] = useState('');
  const [vaultImportMode, setVaultImportMode] = useState<'replace' | 'merge'>('replace');
  const [isProcessingVault, setIsProcessingVault] = useState(false);

  // Plaintext Export State
  const [acknowledgedPlaintextRisk, setAcknowledgedPlaintextRisk] = useState(false);
  const [plaintextFormat, setPlaintextFormat] = useState<'csv' | 'json'>('csv');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle .vault file selection
  const handleVaultFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setVaultFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const payload = parseVaultFileContent(content);
          setImportedVaultPayload(payload);
        } catch (err: unknown) {
          onShowToast(err instanceof Error ? err.message : 'Invalid .vault file structure.', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  // Handle CSV file selection
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCsvFileName(file.name);
      setIsParsingCsv(true);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const items = parseCsvToVaultItems(content);
          setCsvPreviewItems(items);
          setIsParsingCsv(false);
          if (items.length === 0) {
            onShowToast('No valid login or note records detected in CSV.', 'error');
          }
        } catch {
          setIsParsingCsv(false);
          onShowToast('Failed to parse CSV file.', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  // Download Encrypted .vault file
  const handleDownloadVaultBackup = () => {
    if (!encryptedPayload) {
      onShowToast('No encrypted vault payload available to export.', 'error');
      return;
    }
    const cleanName = (vault?.name || 'vault').toLowerCase().replace(/\s+/g, '-');
    const filename = `${cleanName}-${new Date().toISOString().slice(0, 10)}.vault`;
    downloadEncryptedVaultFile(encryptedPayload, filename);
    onShowToast(`Encrypted backup "${filename}" downloaded.`, 'success');
  };

  // Download Plaintext Export
  const handleDownloadPlaintext = () => {
    if (!vault) return;
    if (!acknowledgedPlaintextRisk) {
      onShowToast('Please acknowledge the security warning before exporting.', 'error');
      return;
    }
    downloadDecryptedExport(vault, plaintextFormat);
    onShowToast(`Unencrypted ${plaintextFormat.toUpperCase()} exported.`, 'info');
  };

  // Confirm CSV Import
  const handleConfirmCsvImport = () => {
    if (csvPreviewItems.length === 0) return;
    onImportCsvItems(csvPreviewItems, csvTargetFolderId);
    onShowToast(`Successfully imported ${csvPreviewItems.length} items from CSV!`, 'success');
    onClose();
  };

  // Confirm Vault File Import
  const handleConfirmVaultImport = async () => {
    if (!importedVaultPayload) return;
    try {
      setIsProcessingVault(true);
      await onImportVaultFile(importedVaultPayload, vaultImportMode);
      onShowToast('Vault backup file processed successfully!', 'success');
      onClose();
    } catch (err: unknown) {
      setIsProcessingVault(false);
      onShowToast(err instanceof Error ? err.message : 'Failed to import vault file.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/10 p-6 sm:p-7 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
            <ArrowDownUp className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Import & Export</h2>
            <p className="text-xs text-slate-400">Encrypted .vault backups, CSV imports, and data migration</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-4 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveTab('export-vault')}
            className={`py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === 'export-vault'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Export .vault
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import-vault')}
            className={`py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === 'import-vault'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Import .vault
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import-csv')}
            className={`py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === 'import-csv'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Import CSV
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export-plain')}
            className={`py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === 'export-plain'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Export Plain
          </button>
        </div>

        {/* TAB 1: EXPORT ENCRYPTED .VAULT */}
        {activeTab === 'export-vault' && (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
                <Shield className="h-4 w-4" />
                <span>Zero-Knowledge Encrypted Backup</span>
              </div>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Exporting your vault produces a <strong className="text-white">.vault</strong> file that remains fully encrypted with AES-256-GCM. It is 100% safe to store in cloud drives, USB flash keys, or send via email. Only someone with your Master Password can decrypt it.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-xs space-y-2 backdrop-blur-md">
              <div className="flex justify-between text-slate-400">
                <span>Vault Items:</span>
                <span className="font-mono text-slate-200">{vault?.items.length || 0}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Folders:</span>
                <span className="font-mono text-slate-200">{vault?.folders.length || 0}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Cipher:</span>
                <span className="font-mono text-slate-200">AES-256-GCM (PBKDF2 600k rounds)</span>
              </div>
            </div>

            <button
              onClick={handleDownloadVaultBackup}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 px-4 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition"
            >
              <Download className="h-4 w-4" />
              <span>Download Encrypted .vault Backup</span>
            </button>
          </div>
        )}

        {/* TAB 2: IMPORT ENCRYPTED .VAULT */}
        {activeTab === 'import-vault' && (
          <div className="mt-5 space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl border-2 border-dashed border-white/15 hover:border-indigo-500 bg-white/5 p-6 text-center cursor-pointer transition backdrop-blur-md"
            >
              <Upload className="mx-auto h-8 w-8 text-indigo-400 mb-2" />
              <p className="text-xs font-semibold text-slate-200">
                {vaultFileName ? vaultFileName : 'Click to select or drag .vault file here'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports encrypted JSON or .vault files
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".vault,.json"
              onChange={handleVaultFileChange}
              className="hidden"
            />

            {importedVaultPayload && (
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Valid Encrypted Vault Header Detected</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Import Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setVaultImportMode('replace')}
                      className={`p-2.5 rounded-xl text-xs font-medium border text-left transition backdrop-blur-md ${
                        vaultImportMode === 'replace'
                          ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200'
                          : 'border-white/10 text-slate-400 hover:text-white bg-white/5'
                      }`}
                    >
                      <strong className="block text-slate-200">Replace Vault</strong>
                      <span className="text-[10px] text-slate-400">Overwrites local vault with imported file</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVaultImportMode('merge')}
                      className={`p-2.5 rounded-xl text-xs font-medium border text-left transition backdrop-blur-md ${
                        vaultImportMode === 'merge'
                          ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200'
                          : 'border-white/10 text-slate-400 hover:text-white bg-white/5'
                      }`}
                    >
                      <strong className="block text-slate-200">Merge Vault</strong>
                      <span className="text-[10px] text-slate-400">Appends non-duplicate records</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleConfirmVaultImport}
                  disabled={isProcessingVault}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 px-4 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition disabled:opacity-50"
                >
                  {isProcessingVault ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing & Decrypting...</span>
                    </>
                  ) : (
                    <span>Confirm & Apply .vault File</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: IMPORT CSV */}
        {activeTab === 'import-csv' && (
          <div className="mt-5 space-y-4">
            <div
              onClick={() => csvInputRef.current?.click()}
              className="rounded-2xl border-2 border-dashed border-white/15 hover:border-indigo-500 bg-white/5 p-6 text-center cursor-pointer transition backdrop-blur-md"
            >
              <FileSpreadsheet className="mx-auto h-8 w-8 text-indigo-400 mb-2" />
              <p className="text-xs font-semibold text-slate-200">
                {csvFileName ? csvFileName : 'Click to select Bitwarden, Chrome, or 1Password CSV'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Parses titles, usernames, passwords, URLs, and notes safely inside browser
              </p>
            </div>

            <input
              ref={csvInputRef}
              type="file"
              accept=".csv"
              onChange={handleCsvFileChange}
              className="hidden"
            />

            {csvPreviewItems.length > 0 && (
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{csvPreviewItems.length} items parsed and ready</span>
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {csvPreviewItems.filter((i) => i.type === 'login').length} logins
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Assign to Folder (Optional)
                  </label>
                  <select
                    value={csvTargetFolderId || ''}
                    onChange={(e) => setCsvTargetFolderId(e.target.value || null)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer backdrop-blur-md"
                  >
                    <option value="" className="bg-[#0e0e12] text-white">(No specific folder)</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id} className="bg-[#0e0e12] text-white">
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleConfirmCsvImport}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 px-4 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition"
                >
                  <span>Import {csvPreviewItems.length} Items into Vault</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: EXPORT PLAINTEXT */}
        {activeTab === 'export-plain' && (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs mb-1">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Security Warning: Unencrypted Plaintext</span>
              </div>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                Exporting in plaintext will write all your passwords, cards, and secret notes to an unencrypted file on your computer. Anyone with access to that file can read your secrets. Delete the file immediately after use.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Export Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlaintextFormat('csv')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold border transition backdrop-blur-md ${
                      plaintextFormat === 'csv'
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                        : 'border-white/10 text-slate-400 hover:text-white bg-white/5'
                    }`}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>CSV Spreadsheet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlaintextFormat('json')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold border transition backdrop-blur-md ${
                      plaintextFormat === 'json'
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                        : 'border-white/10 text-slate-400 hover:text-white bg-white/5'
                    }`}
                  >
                    <FileCode className="h-4 w-4" />
                    <span>Plaintext JSON</span>
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-2.5 pt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acknowledgedPlaintextRisk}
                  onChange={(e) => setAcknowledgedPlaintextRisk(e.target.checked)}
                  className="mt-0.5 rounded bg-white/5 border-white/20 text-rose-600 focus:ring-rose-500/20"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  I understand the security risks of downloading unencrypted passwords.
                </span>
              </label>

              <button
                onClick={handleDownloadPlaintext}
                disabled={!acknowledgedPlaintextRisk}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 py-3 px-4 text-xs font-semibold text-white shadow-lg shadow-rose-600/25 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <Download className="h-4 w-4" />
                <span>Export Unencrypted {plaintextFormat.toUpperCase()}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
