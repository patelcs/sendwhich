import { WalletRegistry, InjectedWalletAdapter, MiniKitAdapter } from '@/wallet-adapter';
import { mainnet, sepolia, worldchain, worldchainSepolia } from 'viem/chains';
import { env } from '../env';

export function createWalletRegistry() {
  if (env.isMiniApp) {
    const miniKitAdapter = new MiniKitAdapter(env.miniAppId);
    return new WalletRegistry([miniKitAdapter]);
  }
  const injectedWalletAdapter = new InjectedWalletAdapter([mainnet, sepolia, worldchain, worldchainSepolia]);
  return new WalletRegistry([injectedWalletAdapter]);
}
