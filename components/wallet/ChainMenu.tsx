'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Waypoints } from 'lucide-react';
import { useWallet } from '@/providers/WalletProvider';

export default function ChainMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { supportedChains, chainId, switchChain } = useWallet();

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const activeChain = supportedChains.find((chain) => chain.id === chainId);

  const handleSelect = (id: number) => {
    void switchChain(id);
    setIsOpen(false);
  };

  const activeChainName = activeChain?.name ?? `Chain ${chainId}`;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls="chain-menu"
        aria-label={`Network: ${activeChainName}`}
        className="flex items-center justify-center gap-2 rounded-lg border border-(--border) bg-(--accent) px-2.5 py-2 text-sm font-semibold text-(--foreground) shadow-sm transition-colors hover:bg-(--border) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:px-3"
      >
        <Waypoints size={16} className="shrink-0 text-blue-500" aria-hidden="true" />
        <span className="hidden max-w-28 truncate sm:inline">{activeChainName}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          id="chain-menu"
          role="dialog"
          aria-label="Switch network"
          className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-(--border) bg-(--card) p-2 shadow-2xl"
        >
          <p className="px-2 py-1.5 text-xs font-semibold tracking-wide text-(--muted) uppercase">Networks</p>

          <div className="space-y-0.5">
            {supportedChains.map((chain) => {
              const isSelected = chain.id === chainId;

              return (
                <button
                  key={chain.id}
                  type="button"
                  onClick={() => handleSelect(chain.id)}
                  aria-current={isSelected}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors ${
                    isSelected ? 'bg-blue-500/10 text-blue-500' : 'text-(--foreground) hover:bg-(--accent)'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Waypoints size={14} className="shrink-0" aria-hidden="true" />
                    <span className="truncate">{chain.name}</span>
                  </span>
                  {isSelected && <Check size={16} className="shrink-0" aria-label="Active network" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
