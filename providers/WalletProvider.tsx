'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createWalletRegistry, WalletOption, WalletState, WalletInterface } from '@/wallet-adapter';

interface WalletContextValues extends WalletState, Omit<WalletInterface, 'state'> { }

const WalletContext = createContext<WalletContextValues | null>(null);

export const useWallet = () => {
  const wallet = useContext(WalletContext);
  if (!wallet) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return wallet;
};

export default function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [registry] = useState(() => createWalletRegistry());
  const [walletOptions, setWalletOptions] = useState<readonly WalletOption[]>(() => registry.walletOptions);
  const [state, setState] = useState<WalletState>(() => registry.state);

  useEffect(() => {
    const unSubscribers = [
      registry.on('walletsChanged', setWalletOptions),
      registry.on('stateUpdated', setState),
    ];

    void registry.initialize();

    return () => {
      unSubscribers.forEach((unSubscribe) => unSubscribe());
    };
  }, [registry]);

  return (
    <WalletContext.Provider value={{ ...registry, ...state, walletOptions }}>
      {children}
    </WalletContext.Provider>
  );
}
