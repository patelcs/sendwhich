'use client';

import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { useWallet } from '@/providers/WalletProvider';
import ConnectModal from './ConnectModal';
import { uiConfigs } from '@/configs';

export default function ConnectButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { adapterOptions, connect } = useWallet();

  const handleConnect = (adapterOptionId: string) => {
    void connect(adapterOptionId);
    setIsModalOpen(false);
  };

  const handleClick = () => {
    if (adapterOptions.length === 1) {
      handleConnect(adapterOptions[0].id);
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center justify-center gap-2 rounded-lg border border-(--brand)/30 bg-(--brand)/10 px-5 py-2.5 text-sm font-semibold text-(--brand) shadow-sm shadow-(--brand)/15 transition-colors hover:border-(--brand)/50 hover:bg-(--brand)/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brand) disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Wallet size={16} aria-hidden="true" />
        {uiConfigs.connectName}
      </button>

      <ConnectModal
        isOpen={isModalOpen}
        adapterOptions={adapterOptions}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleConnect}
      />
    </>
  );
}
