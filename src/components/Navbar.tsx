import React from 'react';
import {
  Search,
  Plus,
  Key,
  CreditCard,
  FileText,
  Lock,
  Sparkles,
  Menu,
  Sun,
  Moon,
  X,
  Shield,
  Star,
  Layers,
} from 'lucide-react';
import { ActiveSection, VaultItemType } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
  onOpenNewItemModal: (type?: VaultItemType) => void;
  onOpenGeneratorModal: () => void;
  onLockVault: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onToggleMobileSidebar: () => void;
  totalItemsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  activeSection,
  onSectionChange,
  onOpenNewItemModal,
  onOpenGeneratorModal,
  onLockVault,
  theme,
  onToggleTheme,
  onToggleMobileSidebar,
}) => {
  const [showNewDropdown, setShowNewDropdown] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 flex flex-col border-b border-white/5 bg-black/20 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Mobile Menu Toggle & Brand / Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 font-bold">
              <Shield className="h-4 w-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-white hidden sm:inline-block">
              Vault Note
            </span>
          </div>
        </div>

        {/* Center: Search Input */}
        <div className="flex-1 max-w-md relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search secure vault..."
              className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-8 py-2 text-xs sm:text-sm text-[#f8fafc] placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500/60 transition shadow-inner backdrop-blur-md"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 p-1 text-slate-500 hover:text-slate-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* New Item Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNewDropdown(!showNewDropdown)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs sm:text-sm font-medium text-white shadow-lg shadow-indigo-600/20 transition-colors"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Item</span>
            </button>

            {showNewDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNewDropdown(false)}
                />
                <div className="absolute right-0 mt-2 z-50 w-48 rounded-2xl bg-[#0e0e12]/95 border border-white/10 p-1.5 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => {
                      onOpenNewItemModal('login');
                      setShowNewDropdown(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition text-left"
                  >
                    <Key className="h-4 w-4 text-indigo-400" />
                    <span>New Login</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenNewItemModal('card');
                      setShowNewDropdown(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition text-left"
                  >
                    <CreditCard className="h-4 w-4 text-purple-400" />
                    <span>New Bank Card</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenNewItemModal('note');
                      setShowNewDropdown(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition text-left"
                  >
                    <FileText className="h-4 w-4 text-amber-400" />
                    <span>New Secure Note</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Quick Password Generator Button */}
          <button
            onClick={onOpenGeneratorModal}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-2.5 py-2 text-xs font-medium text-slate-300 hover:text-white backdrop-blur-md transition"
            title="Password Generator"
          >
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span className="hidden md:inline">Generator</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* PWA Install */}
          <div className="hidden lg:block">
            <PWAInstallButton />
          </div>

          {/* Lock Vault Button */}
          <button
            onClick={onLockVault}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-300 backdrop-blur-md transition"
            title="Lock Vault Now"
          >
            <Lock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Lock</span>
          </button>
        </div>
      </div>

      {/* Quick Section Filter Pills (Horizontal on mobile/tablet) */}
      <div className="flex items-center gap-1.5 pt-2.5 overflow-x-auto no-scrollbar md:hidden">
        <button
          onClick={() => onSectionChange('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
            activeSection === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/10'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>All</span>
        </button>
        <button
          onClick={() => onSectionChange('logins')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
            activeSection === 'logins'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/10'
          }`}
        >
          <Key className="h-3.5 w-3.5 text-indigo-400" />
          <span>Logins</span>
        </button>
        <button
          onClick={() => onSectionChange('cards')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
            activeSection === 'cards'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/10'
          }`}
        >
          <CreditCard className="h-3.5 w-3.5 text-purple-400" />
          <span>Cards</span>
        </button>
        <button
          onClick={() => onSectionChange('notes')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
            activeSection === 'notes'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/10'
          }`}
        >
          <FileText className="h-3.5 w-3.5 text-amber-400" />
          <span>Notes</span>
        </button>
        <button
          onClick={() => onSectionChange('favorites')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
            activeSection === 'favorites'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/10'
          }`}
        >
          <Star className="h-3.5 w-3.5 text-amber-400" />
          <span>Favorites</span>
        </button>
      </div>
    </header>
  );
};
