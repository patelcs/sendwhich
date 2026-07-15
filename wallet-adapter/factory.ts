import { MiniKit } from '@worldcoin/minikit-js';
import { WalletRegistry } from './core';
import { InjectedWalletAdapter, MiniKitAdapter } from './adapters';

export function createWalletRegistry() {
  const { success } = MiniKit.install();
  if (success) {
    return new WalletRegistry([new MiniKitAdapter()]);
  }
  return new WalletRegistry([new InjectedWalletAdapter()]);
}