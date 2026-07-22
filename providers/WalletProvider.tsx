'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  WalletRegistry,
  InjectedWalletAdapter,
  MiniKitAdapter,
  type AdapterInterface,
} from '@/wallet-adapter';

export interface UIConfigs {
  mobileNavbarType: 'DropDown' | 'Bottom';
}

interface WalletContextValues extends Omit<
  AdapterInterface<UIConfigs>,
  'initialize'
> {}

const WalletContext = createContext<WalletContextValues | null>(null);

export const useWallet = () => {
  const wallet = useContext(WalletContext);
  if (!wallet) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return wallet;
};

export function createWalletRegistry() {
  const miniKitAdapter = new MiniKitAdapter<UIConfigs>({
    configs: { mobileNavbarType: 'Bottom' },
  });
  if (miniKitAdapter.isMinikitEnvironment) {
    return new WalletRegistry<UIConfigs>({
      adapters: [miniKitAdapter],
      configs: { mobileNavbarType: 'Bottom' },
    });
  }
  const injectedWalletAdapter = new InjectedWalletAdapter<UIConfigs>({
    configs: { mobileNavbarType: 'DropDown' },
  });
  return new WalletRegistry<UIConfigs>({
    adapters: [injectedWalletAdapter],
    configs: { mobileNavbarType: 'Bottom' },
  });
}

export default function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [registry] = useState(() => createWalletRegistry());
  const [walletOptions, setWalletOptions] = useState(registry.walletOptions);
  const [configs, setConfigs] = useState(registry.configs);
  const [status, setStatus] = useState(registry.status);
  const [chainId, setChainId] = useState(registry.chainId);
  const [accounts, switchAccounts] = useState(registry.accounts);
  const [activeAccount, setActiveAccount] = useState(registry.activeAccount);

  useEffect(() => {
    const unSubscribers = [
      registry.on('configsUpdated', setConfigs),
      registry.on('walletAdded', () =>
        setWalletOptions(registry.walletOptions),
      ),
      registry.on('statusUpdated', setStatus),
      registry.on('chainIdUpdated', setChainId),
      registry.on('accountsUpdated', switchAccounts),
      registry.on('accountUpdated', setActiveAccount),
    ];

    void registry.initialize();

    return () => {
      unSubscribers.forEach((unSubscribe) => unSubscribe());
    };
  }, [registry]);

  return (
    <WalletContext.Provider
      value={{
        configs,
        status,
        chainId,
        accounts,
        activeAccount,
        walletOptions,
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
