'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Wallet, X } from 'lucide-react';
import { useWallet } from '@/providers';

type ConnectButtonProps = {
  iconOnly?: boolean;
};

export default function ConnectButton({
  iconOnly = false,
}: ConnectButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const wallet = useWallet();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 text-sm font-semibold text-blue-500 shadow-sm shadow-blue-500/15 transition-colors hover:border-blue-500/50 hover:bg-blue-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
          iconOnly ? 'p-2' : 'px-3 py-2'
        }`}
        aria-label={iconOnly ? 'Connect wallet' : undefined}
      >
        <Wallet size={16} aria-hidden="true" />
        {!iconOnly && 'Connect Wallet'}
      </button>

      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="connect-wallet-title"
              className="w-full max-w-sm rounded-2xl border border-(--border) bg-(--card) p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2
                  id="connect-wallet-title"
                  className="text-lg font-bold text-(--foreground)"
                >
                  Connect Wallet
                </h2>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-(--muted) transition-colors hover:text-(--foreground)"
                  aria-label="Close connect wallet dialog"
                >
                  <X size={20} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  wallet.connect();
                  setIsModalOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-sm font-medium text-(--foreground) transition-all hover:border-blue-500/50 hover:bg-blue-500/5"
              >
                <Wallet size={18} className="text-blue-500" aria-hidden="true" />
                Connect wallet
              </button>

              <p className="mt-4 text-center text-xs text-(--muted)">
                By connecting, you agree to the terms of service.
              </p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
