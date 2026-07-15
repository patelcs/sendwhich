import { initializeEruda } from '../../lib';
import { WalletAdapter, UIConfigs, WalletOption, Account } from '../../core';
import { MiniKit } from '@worldcoin/minikit-js';
import type {
  CommandResultByVia,
  MiniKitWalletAuthOptions,
  WalletAuthResult,
} from '@worldcoin/minikit-js/commands';

export class MiniKitAdapter extends WalletAdapter {

  private readonly uiConfigs: UIConfigs = {
    mobileNavbarType: 'Bottom',
  };

  constructor() {
    super();
    this.addWalletOption({
      id: 'minikit-wallet',
      name: 'MiniKit Wallet',
      icon: ''
    })
    this.updateState({ uiConfigs: this.uiConfigs });
  }

  initialize = async () => {
    try {
      await initializeEruda();
    } catch (error) {
      console.error("initialization error:", error);
    }
  }

  connect = async (walletId: string) => {
    const input = {
      nonce: 'randomnonce123456',
    } satisfies MiniKitWalletAuthOptions;
    try {
      const result: CommandResultByVia<WalletAuthResult> =
        await MiniKit.walletAuth(input);
      const account = result.data.address as Account;
      this.updateState({ status: 'connected', accounts: [account], account });
      console.log('executedWith:', result.executedWith); // "minikit" | "wagmi" | "fallback"
      console.log('address:', result.data.address);
      console.log('signature:', result.data.signature);
      console.log('result:', result);
    } catch (error) {
      console.error('Command failed', error);
      this.updateState({ status: 'disconnected', accounts: [], account: null });
    }
  }

  disconnect = async () => {
    this.updateState({ status: 'disconnected', accounts: [], account: null });
  }
}
