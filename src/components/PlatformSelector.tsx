import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Globe, ChevronDown, Check, X, Sparkles } from 'lucide-react';
import { PlatformInfo, PLATFORM_CATALOG, searchPlatforms } from '../data/platforms';

interface PlatformSelectorProps {
  selectedTitle: string;
  onSelectPlatform: (platform: PlatformInfo) => void;
  className?: string;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedTitle,
  onSelectPlatform,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredPlatforms = useMemo(() => {
    return searchPlatforms(searchQuery);
  }, [searchQuery]);

  const popularPlatforms = useMemo(() => {
    return PLATFORM_CATALOG.filter((p) => p.popular).slice(0, 8);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % Math.max(1, filteredPlatforms.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredPlatforms.length) % Math.max(1, filteredPlatforms.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredPlatforms[highlightedIndex]) {
        handleChoose(filteredPlatforms[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleChoose = (platform: PlatformInfo) => {
    onSelectPlatform(platform);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`space-y-2 ${className}`} ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-indigo-400" />
          <span>Platform / Service</span>
          <span className="text-[10px] text-slate-400 font-normal">(Offline catalog)</span>
        </label>
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition"
        >
          {isOpen ? 'Close Catalog' : 'Browse Catalog'}
          <ChevronDown className={`h-3 w-3 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Popular Quick Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        {popularPlatforms.map((p) => {
          const isCurrent = selectedTitle.toLowerCase() === p.name.toLowerCase();
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleChoose(p)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition backdrop-blur-md ${
                isCurrent
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400'
                  : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: p.color || '#6366f1' }}
              />
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* Dropdown Catalog Modal/Popover */}
      {isOpen && (
        <div className="relative z-20 mt-2 rounded-2xl bg-[#0c0c10]/95 border border-white/15 shadow-2xl backdrop-blur-2xl p-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search Google, GitHub, Discord, Steam, Spotify..."
              className="w-full rounded-xl bg-white/5 border border-white/10 pl-8.5 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition font-medium"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filteredPlatforms.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                <p>No matching platform found in catalog.</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  You can type custom service details directly into the fields below.
                </p>
              </div>
            ) : (
              filteredPlatforms.map((p, index) => {
                const isSelected = selectedTitle.toLowerCase() === p.name.toLowerCase();
                const isHighlighted = highlightedIndex === index;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleChoose(p)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition ${
                      isHighlighted
                        ? 'bg-indigo-600/30 border border-indigo-500/40 text-white'
                        : isSelected
                        ? 'bg-white/10 text-white'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: p.color || '#6366f1' }}
                      />
                      <div className="truncate">
                        <span className="font-semibold text-slate-100">{p.name}</span>
                        <span className="ml-2 text-[11px] text-slate-400 font-mono">{p.domain}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/10">
                        {p.category}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-indigo-400" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
