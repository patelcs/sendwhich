'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Wallet, X } from 'lucide-react';
import type { WalletOption } from '@/wallet-adapter';

interface ConnectWalletModalProps {
  isOpen: boolean;
  walletOptions: readonly WalletOption[];
  onClose: () => void;
  onSelect: (walletId: string) => void;
}

export default function ConnectWalletModal({ isOpen, walletOptions, onClose, onSelect }: ConnectWalletModalProps) {
  const [failedWalletIcons, setFailedWalletIcons] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="connect-wallet-title"
        className="w-full max-w-sm rounded-2xl border border-(--border) bg-(--card) p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="connect-wallet-title" className="text-lg font-bold text-(--foreground)">
            Connect Wallet
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-(--muted) transition-colors hover:text-(--foreground)"
            aria-label="Close connect wallet dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2">
          {walletOptions.map((walletOption) => (
            <button
              key={walletOption.id}
              type="button"
              onClick={() => onSelect(walletOption.id)}
              className="flex w-full items-center gap-3 rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-left text-sm font-medium text-(--foreground) transition-all hover:border-(--brand)/50 hover:bg-(--brand)/5"
            >
              {walletOption.icon && !failedWalletIcons.has(walletOption.id) ? (
                // Wallet providers supply these external icon URLs at runtime.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={walletOption.icon}
                  alt=""
                  width={18}
                  height={18}
                  className="size-4.5 shrink-0 rounded-sm"
                  onError={() => setFailedWalletIcons((failedIcons) => new Set(failedIcons).add(walletOption.id))}
                />
              ) : (
                <Wallet size={18} className="text-(--brand)" aria-hidden="true" />
              )}
              {walletOption.name}
            </button>
          ))}
        </div>

        {walletOptions.length === 0 && <p className="text-center text-sm text-(--muted)">No wallets are available.</p>}

        <p className="mt-4 text-center text-xs text-(--muted)">By connecting, you agree to the terms of service.</p>
      </div>
    </div>,
    document.body,
  );
}
