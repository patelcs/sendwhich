import { WalletRegistry, InjectedWalletAdapter, MiniKitAdapter } from '@/wallet-adapter';
import { mainnet, sepolia, worldchain, worldchainSepolia } from 'viem/chains';
import { CreateRegistryResponse } from './types';
import { MINIKIT_CONFIGS } from './minikitConfigs';
import { BROWSER_CONFIGS } from './browserConfigs';

export function createWalletRegistry(): CreateRegistryResponse {
  const miniKitAdapter = new MiniKitAdapter();
  if (miniKitAdapter.isMinikitEnvironment) {
    return { registry: new WalletRegistry([miniKitAdapter]), defaultAdapterConfigs: MINIKIT_CONFIGS };
  }
  const injectedWalletAdapter = new InjectedWalletAdapter([mainnet, sepolia, worldchain, worldchainSepolia]);
  return { registry: new WalletRegistry([injectedWalletAdapter]), defaultAdapterConfigs: BROWSER_CONFIGS };
}
