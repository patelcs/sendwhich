'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Wallet, X } from 'lucide-react';
import type { ActiveAccount, Accounts } from '@/wallet-adapter';
import { useWallet } from '@/providers/WalletProvider';

function formatAccount(account: ActiveAccount) {
  if (!account) return 'Connected';

  return `${account.slice(0, 6)}…${account.slice(-4)}`;
}

export default function ConnectButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [failedWalletIcons, setFailedWalletIcons] = useState<Set<string>>(
    new Set(),
  );
  const [isAccountsOpen, setIsAccountsOpen] = useState(false);
  const {
    walletOptions,
    status,
    accounts,
    activeAccount,
    switchAccount,
    connect,
    disconnect,
  } = useWallet();

  const handleConnect = (walletId: string) => {
    void connect(walletId);
    setIsModalOpen(false);
  };

  const handleDisconnect = () => {
    void disconnect();
    setIsModalOpen(false);
    setIsAccountsOpen(false);
  };

  const handleClick = () => {
    if (walletOptions.length === 1) {
      handleConnect(walletOptions[0].id);
      return;
    } else {
      setIsModalOpen(true);
    }
  };

  const handleAccountSelect = (selectedAccount: ActiveAccount) => {
    if (!selectedAccount) return;
    switchAccount(selectedAccount);
    setIsAccountsOpen(false);
  };

  const connectedAccounts: Accounts = accounts;

  if (status === 'connected') {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsAccountsOpen((open) => !open)}
          aria-expanded={isAccountsOpen}
          aria-haspopup="dialog"
          aria-controls="connected-accounts"
          className="flex items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm font-semibold text-blue-500 shadow-sm shadow-blue-500/15 transition-colors hover:border-blue-500/50 hover:bg-blue-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          <span className="max-w-28 truncate">
            {formatAccount(activeAccount)}
          </span>
          <ChevronDown size={16} aria-hidden="true" />
        </button>

        {isAccountsOpen && (
          <div
            id="connected-accounts"
            role="dialog"
            aria-label="Connected accounts"
            className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-(--border) bg-(--card) p-2 shadow-2xl"
          >
            <p className="px-2 py-1 text-xs font-medium text-(--muted)">
              Connected accounts
            </p>
            <div className="space-y-1">
              {connectedAccounts.map((connectedAccount) => {
                const isSelected = connectedAccount === activeAccount;

                return (
                  <button
                    key={connectedAccount}
                    type="button"
                    onClick={() => handleAccountSelect(connectedAccount)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left text-sm text-(--foreground) transition-colors hover:bg-(--accent)"
                  >
                    <span className="truncate">{connectedAccount}</span>
                    {isSelected && (
                      <Check
                        size={16}
                        className="shrink-0 text-blue-500"
                        aria-label="Current account"
                      />
                    )}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={handleDisconnect}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left text-sm text-(--foreground) transition-colors hover:bg-(--accent)"
              >
                <span className="truncate">Disconnect</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={status === 'connecting'}
        className={`flex items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 text-sm font-semibold text-blue-500 shadow-sm shadow-blue-500/15 transition-colors hover:border-blue-500/50 hover:bg-blue-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 px-3 py-2`}
      >
        <Wallet size={16} aria-hidden="true" />
        {status === 'disconnected' ? 'Connect Wallet' : 'Connecting…'}
      </button>

      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
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

              <div className="space-y-2">
                {walletOptions.map((walletOption) => (
                  <button
                    key={walletOption.id}
                    type="button"
                    onClick={() => handleConnect(walletOption.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-left text-sm font-medium text-(--foreground) transition-all hover:border-blue-500/50 hover:bg-blue-500/5"
                  >
                    {walletOption.icon &&
                    !failedWalletIcons.has(walletOption.id) ? (
                      // Wallet providers supply these external icon URLs at runtime.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={walletOption.icon}
                        alt=""
                        width={18}
                        height={18}
                        className="size-4.5 shrink-0 rounded-sm"
                        onError={() =>
                          setFailedWalletIcons((failedIcons) =>
                            new Set(failedIcons).add(walletOption.id),
                          )
                        }
                      />
                    ) : (
                      <Wallet
                        size={18}
                        className="text-blue-500"
                        aria-hidden="true"
                      />
                    )}
                    {walletOption.name}
                  </button>
                ))}
              </div>

              {walletOptions.length === 0 && (
                <p className="text-center text-sm text-(--muted)">
                  No wallets are available.
                </p>
              )}

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
