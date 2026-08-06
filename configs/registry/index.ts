import { WalletRegistry, InjectedWalletAdapter, MiniKitAdapter } from '@/wallet-adapter';
import { env } from '../env';
import { BROWSER_CHAIN_CONFIGS } from '../chain';

export function createWalletRegistry() {
  if (env.isMiniApp) {
    const miniKitAdapter = new MiniKitAdapter(env.miniAppId);
    return new WalletRegistry([miniKitAdapter]);
  }
  const injectedWalletAdapter = new InjectedWalletAdapter(BROWSER_CHAIN_CONFIGS.map(c => c.chain));
  return new WalletRegistry([injectedWalletAdapter]);
}
