'use client';

import { WalletAdapter } from '@/wallets/adapter/WalletAdapter';
import { createWallet } from '@/wallets/factory';
import { createContext, useContext, useEffect, useState } from 'react';

const WalletContext = createContext<WalletAdapter | null>(null);

export const useWallet = () => {
  const wallet = useContext(WalletContext);
  if (!wallet) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return wallet;
};

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet] = useState(() => createWallet());

  useEffect(() => {
    void wallet.initialize();
  }, [wallet]);

  return (
    <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>
  );
}
