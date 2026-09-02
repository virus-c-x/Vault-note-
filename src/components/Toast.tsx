import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { ToastNotification } from '../types';

interface ToastProps {
  toasts: ToastNotification[];
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-white/15 bg-[#0a0a0c]/85 p-3.5 shadow-2xl backdrop-blur-2xl text-slate-100 transition-all animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {toast.type === 'success' && (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          )}
          {toast.type === 'error' && (
            <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          {toast.type === 'info' && (
            <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
          )}

          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-slate-100 leading-snug">{toast.message}</p>
          </div>

          <button
            onClick={() => onClose(toast.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export const ToastContainer = Toast;
