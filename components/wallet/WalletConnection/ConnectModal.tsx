'use client';

import { useState } from 'react';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { createPortal } from 'react-dom';
import { Wallet, X } from 'lucide-react';
import type { AdapterOption } from '@/wallet-adapter';

interface ConnectModalProps {
  isOpen: boolean;
  adapterOptions: readonly AdapterOption[];
  onClose: () => void;
  onSelect: (adapterOptionId: string) => void;
}

export default function ConnectModal({ isOpen, adapterOptions, onClose, onSelect }: ConnectModalProps) {
  const [failedWalletIcons, setFailedWalletIcons] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-(--overlay)/50 p-4 backdrop-blur-md">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="connect-wallet-title"
        className="w-full max-w-sm rounded-2xl border border-(--border) bg-(--card) p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <BrandLogo size={20} />
            <h2 id="connect-wallet-title" className="truncate text-lg font-bold text-brand-gradient">
              Connect Wallet
            </h2>
          </div>
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
          {adapterOptions.map((adapterOption) => (
            <button
              key={adapterOption.id}
              type="button"
              onClick={() => onSelect(adapterOption.id)}
              className="flex w-full items-center gap-4 rounded-xl border border-(--border) bg-(--background) px-3 py-3.5 text-left text-base font-medium text-(--foreground) transition-all hover:border-(--brand)/50 hover:bg-(--brand)/5"
            >
              {adapterOption.icon && !failedWalletIcons.has(adapterOption.id) ? (
                // Wallet providers supply these external icon URLs at runtime.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={adapterOption.icon}
                  alt=""
                  width={18}
                  height={18}
                  className="size-4.5 shrink-0 rounded-sm"
                  onError={() => setFailedWalletIcons((failedIcons) => new Set(failedIcons).add(adapterOption.id))}
                />
              ) : (
                <Wallet size={18} className="text-(--brand)" aria-hidden="true" />
              )}
              {adapterOption.name}
            </button>
          ))}
        </div>

        {adapterOptions.length === 0 && <p className="text-center text-sm text-(--muted)">No wallets are available.</p>}

        <p className="mt-4 text-center text-sm text-(--muted)">By connecting, you agree to the terms of service.</p>
      </div>
    </div>,
    document.body,
  );
}
