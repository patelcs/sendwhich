'use client';

import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { useWallet } from '@/providers/WalletProvider';
import ConnectWalletModal from './ConnectWalletModal';

export default function ConnectWalletButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { walletOptions, status, connect } = useWallet();
  const isConnecting = status === 'connecting';

  const handleConnect = (walletId: string) => {
    void connect(walletId);
    setIsModalOpen(false);
  };

  const handleClick = () => {
    if (walletOptions.length === 1) {
      handleConnect(walletOptions[0].id);
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isConnecting}
        className="flex items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-5 py-2.5 text-sm font-semibold text-blue-500 shadow-sm shadow-blue-500/15 transition-colors hover:border-blue-500/50 hover:bg-blue-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Wallet size={16} aria-hidden="true" />
        {isConnecting ? 'Connecting…' : 'Connect Wallet'}
      </button>

      <ConnectWalletModal
        isOpen={isModalOpen}
        walletOptions={walletOptions}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleConnect}
      />
    </>
  );
}
