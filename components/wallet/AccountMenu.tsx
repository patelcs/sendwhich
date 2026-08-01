'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, LogOut, Wallet } from 'lucide-react';
import type { Account } from '@/wallet-adapter';
import { useWallet } from '@/providers/WalletProvider';

function formatAccount(account: Account) {
  return `${account.slice(0, 6)}…${account.slice(-4)}`;
}

export default function AccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { accounts, activeAccount, switchAccount, disconnect } = useWallet();

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

  const handleSelect = (account: Account) => {
    switchAccount(account);
    setIsOpen(false);
  };

  const handleDisconnect = () => {
    void disconnect();
    setIsOpen(false);
  };

  const activeAccountLabel = activeAccount ? formatAccount(activeAccount) : 'Connected';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls="account-menu"
        aria-label={`Account: ${activeAccountLabel}`}
        className="flex items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-2 text-sm font-semibold text-blue-500 shadow-sm shadow-blue-500/15 transition-colors hover:border-blue-500/50 hover:bg-blue-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:px-3"
      >
        <Wallet size={16} className="shrink-0" aria-hidden="true" />
        <span className="hidden max-w-28 truncate sm:inline">{activeAccountLabel}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          id="account-menu"
          role="dialog"
          aria-label="Connected accounts"
          className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-(--border) bg-(--card) p-2 shadow-2xl"
        >
          <p className="px-2 py-1.5 text-xs font-semibold tracking-wide text-(--muted) uppercase">Accounts</p>

          <div className="space-y-0.5">
            {accounts.map((account) => {
              const isSelected = account === activeAccount;

              return (
                <button
                  key={account}
                  type="button"
                  onClick={() => handleSelect(account)}
                  aria-current={isSelected}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors ${
                    isSelected ? 'bg-blue-500/10 text-blue-500' : 'text-(--foreground) hover:bg-(--accent)'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Wallet size={14} className="shrink-0" aria-hidden="true" />
                    <span className="truncate">{account}</span>
                  </span>
                  {isSelected && <Check size={16} className="shrink-0" aria-label="Active account" />}
                </button>
              );
            })}
          </div>

          <div className="my-2 border-t border-(--border)" />

          <button
            type="button"
            onClick={handleDisconnect}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
          >
            <LogOut size={14} aria-hidden="true" />
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
