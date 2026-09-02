import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  RefreshCw,
  Check,
  X,
  ShieldAlert,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import {
  evaluatePasswordStrength,
  generatePassword,
} from '../crypto/passwordGenerator';
import { PasswordGeneratorOptions } from '../types';

interface PasswordGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopyPassword: (password: string) => void;
}

export const PasswordGeneratorModal: React.FC<PasswordGeneratorModalProps> = ({
  isOpen,
  onClose,
  onCopyPassword,
}) => {
  const [options, setOptions] = useState<PasswordGeneratorOptions>({
    mode: 'password',
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

  const [generatedResult, setGeneratedResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const handleRegenerate = () => {
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 300);
    const pwd = generatePassword(options);
    setGeneratedResult(pwd);
  };

  useEffect(() => {
    if (isOpen) {
      handleRegenerate();
    }
  }, [options, isOpen]);

  if (!isOpen) return null;

  const strength = evaluatePasswordStrength(generatedResult);

  const handleCopy = () => {
    onCopyPassword(generatedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/10 p-6 sm:p-7 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Password Generator</h2>
            <p className="text-xs text-slate-400">
              Cryptographically secure pseudo-random entropy
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setOptions({ ...options, mode: 'password' })}
            className={`py-2 text-xs font-semibold rounded-xl transition ${
              options.mode === 'password'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Random Characters
          </button>
          <button
            type="button"
            onClick={() => setOptions({ ...options, mode: 'passphrase' })}
            className={`py-2 text-xs font-semibold rounded-xl transition ${
              options.mode === 'passphrase'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Memorable Passphrase
          </button>
        </div>

        {/* Result Display Box */}
        <div className="mt-4 rounded-2xl bg-black/30 border border-white/10 p-4 shadow-inner backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div className="font-mono text-sm sm:text-base font-bold text-indigo-200 break-all select-all leading-relaxed">
              {generatedResult}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleRegenerate}
                className={`p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition ${
                  isRotating ? 'rotate-180 duration-300' : ''
                }`}
                title="Regenerate"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Strength info */}
          <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">
                Strength: <strong className="text-slate-200">{strength.label}</strong> ({strength.entropyBits} bits)
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
        </div>

        {/* Configuration Sliders & Toggles */}
        <div className="mt-5 space-y-4">
          {options.mode === 'password' ? (
            <>
              {/* Length Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                  <span>Password Length</span>
                  <span className="font-mono text-indigo-400 font-bold text-sm">
                    {options.length}
                  </span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="64"
                  value={options.length}
                  onChange={(e) => setOptions({ ...options, length: Number(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Character set checkboxes */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.uppercase}
                    onChange={(e) => setOptions({ ...options, uppercase: e.target.checked })}
                    className="rounded bg-white/5 border-white/20 text-indigo-600 focus:ring-indigo-500/20"
                  />
                  <span>Uppercase (A–Z)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.lowercase}
                    onChange={(e) => setOptions({ ...options, lowercase: e.target.checked })}
                    className="rounded bg-white/5 border-white/20 text-indigo-600 focus:ring-indigo-500/20"
                  />
                  <span>Lowercase (a–z)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.numbers}
                    onChange={(e) => setOptions({ ...options, numbers: e.target.checked })}
                    className="rounded bg-white/5 border-white/20 text-indigo-600 focus:ring-indigo-500/20"
                  />
                  <span>Numbers (0–9)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.symbols}
                    onChange={(e) => setOptions({ ...options, symbols: e.target.checked })}
                    className="rounded bg-white/5 border-white/20 text-indigo-600 focus:ring-indigo-500/20"
                  />
                  <span>Symbols (!@#$%)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer col-span-2">
                  <input
                    type="checkbox"
                    checked={options.excludeSimilar}
                    onChange={(e) => setOptions({ ...options, excludeSimilar: e.target.checked })}
                    className="rounded bg-white/5 border-white/20 text-indigo-600 focus:ring-indigo-500/20"
                  />
                  <span>Exclude look-alike chars (0/O, 1/l/I)</span>
                </label>
              </div>
            </>
          ) : (
            /* Passphrase Mode Options */
            <>
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                  <span>Number of Words</span>
                  <span className="font-mono text-indigo-400 font-bold text-sm">
                    {options.wordCount}
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="8"
                  value={options.wordCount}
                  onChange={(e) => setOptions({ ...options, wordCount: Number(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Word Separator
                  </label>
                  <select
                    value={options.separator}
                    onChange={(e) => setOptions({ ...options, separator: e.target.value })}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer backdrop-blur-md"
                  >
                    <option value="-" className="bg-[#0e0e12] text-white">Hyphen (-)</option>
                    <option value="." className="bg-[#0e0e12] text-white">Period (.)</option>
                    <option value="_" className="bg-[#0e0e12] text-white">Underscore (_)</option>
                    <option value=" " className="bg-[#0e0e12] text-white">Space ( )</option>
                  </select>
                </div>

                <div className="space-y-2 pt-4">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.capitalizeWords}
                      onChange={(e) =>
                        setOptions({ ...options, capitalizeWords: e.target.checked })
                      }
                      className="rounded bg-white/5 border-white/20 text-indigo-600"
                    />
                    <span>Capitalize Words</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.includeNumberInPassphrase}
                      onChange={(e) =>
                        setOptions({ ...options, includeNumberInPassphrase: e.target.checked })
                      }
                      className="rounded bg-white/5 border-white/20 text-indigo-600"
                    />
                    <span>Include Random Number</span>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Bottom Controls */}
        <div className="flex items-center justify-end gap-3 pt-5 border-t border-white/10 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
