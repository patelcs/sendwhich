import { initializeEruda } from '@/lib/eruda';
import { WalletAdapter } from '../adapter/WalletAdapter';
import { WalletUIConfigs } from '../adapter/WalletUIConfigs';
import { MiniKit } from '@worldcoin/minikit-js';
import type {
  CommandResultByVia,
  MiniKitWalletAuthOptions,
  WalletAuthResult,
} from '@worldcoin/minikit-js/commands';

export class MiniAppWallet implements WalletAdapter {
  uiConfigs: WalletUIConfigs = {
    mobileNavbarType: 'Bottom',
  };

  async initialize() {
    await initializeEruda();
  }

  async connect() {
    const input = {
      nonce: 'randomnonce123',
    } satisfies MiniKitWalletAuthOptions;
    try {
      const result: CommandResultByVia<WalletAuthResult> =
        await MiniKit.walletAuth(input);
      console.log('executedWith:', result.executedWith); // "minikit" | "wagmi" | "fallback"
      console.log('address:', result.data.address);
      console.log('signature:', result.data.signature);
      console.log('result:', result);
    } catch (error) {
      console.error('Command failed', error);
    }
  }
}
