import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-500/90 text-zinc-950 px-3.5 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2">
      <WifiOff className="h-3.5 w-3.5" />
      <span>Offline Mode — Operating 100% locally from device storage</span>
    </div>
  );
};
