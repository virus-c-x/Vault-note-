import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'button' | 'sidebar-item';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'button',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'sidebar-item') {
      return (
        <button
          onClick={install}
          className={`flex w-full items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/20 bg-indigo-500/10 border border-indigo-500/25 transition backdrop-blur-md ${className}`}
        >
          <Download className="h-4 w-4 text-indigo-400 shrink-0" />
          <span>Install Web App</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className={`flex items-center gap-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/30 transition backdrop-blur-md ${className}`}
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        {variant === 'sidebar-item' ? (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`flex w-full items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl text-slate-300 hover:text-white hover:bg-white/10 bg-white/5 border border-white/10 transition backdrop-blur-md ${className}`}
          >
            <Smartphone className="h-4 w-4 text-slate-400 shrink-0" />
            <span>Install on iOS</span>
          </button>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10 hover:text-white transition backdrop-blur-md ${className}`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Install iOS</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl p-4">
            <div className="w-full max-w-sm rounded-3xl bg-[#0a0a0c]/85 border border-white/10 p-6 shadow-2xl text-slate-100 backdrop-blur-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-indigo-400" />
                  Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-xs text-slate-300">
                <p className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-[10px]">
                    1
                  </span>
                  <span>
                    Tap the <strong className="text-white">Share</strong> button in the Safari browser toolbar (bottom or top bar).
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-[10px]">
                    2
                  </span>
                  <span>
                    Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-[10px]">
                    3
                  </span>
                  <span>
                    Confirm <strong className="text-white">Add</strong>. Vault Note will run as a native standalone offline app!
                  </span>
                </p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-white/10 border border-white/10 py-2.5 text-xs font-semibold text-white hover:bg-white/15 transition backdrop-blur-md"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
