'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { WalletRegistry, InjectedWalletAdapter, MiniKitAdapter, type AdapterInterface } from '@/wallet-adapter';
import { mainnet, sepolia, worldchain, worldchainSepolia } from 'viem/chains';
import WalletLoadingScreen from '@/components/wallet/WalletLoadingScreen';
import WalletConnectScreen from '@/components/wallet/WalletConnectScreen';

interface WalletContextValues extends Omit<Omit<AdapterInterface, 'initialize'>, 'initialConnect'> {}

const WalletContext = createContext<WalletContextValues | null>(null);

export const useWallet = () => {
  const wallet = useContext(WalletContext);
  if (!wallet) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return wallet;
};

export function createWalletRegistry() {
  const miniKitAdapter = new MiniKitAdapter();
  if (miniKitAdapter.isMinikitEnvironment) {
    return new WalletRegistry([miniKitAdapter]);
  }
  const injectedWalletAdapter = new InjectedWalletAdapter([mainnet, sepolia, worldchain, worldchainSepolia]);
  return new WalletRegistry([injectedWalletAdapter]);
}

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  const [registry] = useState(() => createWalletRegistry());
  const [walletOptions, setWalletOptions] = useState(registry.walletOptions);
  const [status, setStatus] = useState(registry.status);
  const [chainId, setChainId] = useState(registry.chainId);
  const [accounts, switchAccounts] = useState(registry.accounts);
  const [activeAccount, setActiveAccount] = useState(registry.activeAccount);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const unSubscribers = [
      registry.on('walletAdded', () => setWalletOptions(registry.walletOptions)),
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

  if (isInitializing) return <WalletLoadingScreen />;

  return (
    <WalletContext.Provider
      value={{
        status,
        supportedChains: registry.supportedChains,
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
      {status === 'connected' ? children : <WalletConnectScreen />}
    </WalletContext.Provider>
  );
}
