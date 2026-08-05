'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { type RegistryInterface } from '@/wallet-adapter';
import { createWalletRegistry } from '@/configs';

interface WalletContextValues extends Omit<RegistryInterface, 'initialize' | 'activeAdapter'> {
  isInitializing: boolean;
}

const WalletContext = createContext<WalletContextValues | null>(null);

export const useWallet = () => {
  const wallet = useContext(WalletContext);
  if (!wallet) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return wallet;
};

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  const [registry] = useState(() => createWalletRegistry());
  const [adapterOptions, setAdapterOptions] = useState(registry.adapterOptions);
  const [status, setStatus] = useState(registry.status);
  const [chainId, setChainId] = useState(registry.chainId);
  const [accounts, switchAccounts] = useState(registry.accounts);
  const [activeAccount, setActiveAccount] = useState(registry.activeAccount);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const unSubscribers = [
      registry.on('adapterOptionsUpdated', setAdapterOptions),
      registry.on('statusUpdated', setStatus),
      registry.on('chainIdUpdated', setChainId),
      registry.on('accountsUpdated', switchAccounts),
      registry.on('accountUpdated', setActiveAccount),
    ];

    registry.initialize().finally(() => setIsInitializing(false));

    return () => {
      unSubscribers.forEach((unSubscribe) => unSubscribe());
    };
  }, [registry]);

  return (
    <WalletContext.Provider
      value={{
        status,
        isInitializing,
        supportedChains: registry.supportedChains,
        chainId,
        accounts,
        activeAccount,
        adapterOptions,
        disconnect: registry.disconnect.bind(registry),
        connect: registry.connect.bind(registry),
        switchAccount: registry.switchAccount.bind(registry),
        switchChain: registry.switchChain.bind(registry),
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
