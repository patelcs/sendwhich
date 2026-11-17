import { WalletRegistry, InjectedWalletAdapter, MiniKitAdapter } from '@/wallet-adapter';
import { env } from '../env';
import { BROWSER_CHAIN_CONFIGS, WORLDCHAIN_CONFIGS, withAppRpcUrls } from '../chain';

export function createWalletRegistry() {
  if (env.isMiniApp) {
    const miniKitAdapter = new MiniKitAdapter(env.miniAppId, withAppRpcUrls(WORLDCHAIN_CONFIGS));
    return new WalletRegistry([miniKitAdapter]);
  }
  const injectedWalletAdapter = new InjectedWalletAdapter(BROWSER_CHAIN_CONFIGS.map(withAppRpcUrls));
  return new WalletRegistry([injectedWalletAdapter]);
}
