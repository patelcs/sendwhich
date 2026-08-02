'use client';

import { useWallet } from '@/providers/WalletProvider';
import WalletConnectScreen from './WalletConnectScreen';
import WalletLoadingScreen from './WalletLoadingScreen';

export default function WalletGate({ children }: { children: React.ReactNode }) {
  const { status, isInitializing } = useWallet();

  if (isInitializing || status === 'connecting') return <WalletLoadingScreen />;
  if (status !== 'connected') return <WalletConnectScreen />;

  return <>{children}</>;
}
