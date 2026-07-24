import { initializeEruda } from '../../lib';
import { WalletAdapter, Account, ChainId, WalletOption } from '../../core';
import { MiniKit } from '@worldcoin/minikit-js';
import type {
  CommandResultByVia,
  MiniKitWalletAuthOptions,
  WalletAuthResult,
} from '@worldcoin/minikit-js/commands';

export class MiniKitAdapter extends WalletAdapter {
  private _install = MiniKit.install();

  get chainId(): ChainId {
    return 480;
  }

  get walletOptions(): readonly WalletOption[] {
    return [
      {
        id: 'minikit-wallet',
        name: 'MiniKit Wallet',
        icon: '',
      },
    ];
  }

  get isMinikitEnvironment() {
    return this._install.success;
  }

  async initialize() {
    if (!this.isMinikitEnvironment)
      throw new Error('Not in MiniApp Environment');
    try {
      await initializeEruda();
    } catch (error) {
      console.error('initialization error:', error);
    }
  }

  async connect(walletId: string) {
    const input = {
      nonce: 'randomnonce123456',
    } satisfies MiniKitWalletAuthOptions;
    try {
      const result: CommandResultByVia<WalletAuthResult> =
        await MiniKit.walletAuth(input);
      const account = result.data.address as Account;
      this.updateAccounts([account]);
    } catch (error) {
      console.error('Command failed', error);
      this.updateAccounts([]);
    }
  }

  async disconnect(): Promise<void> {
    this.resetState();
  }

  async switchAccount(account: Account): Promise<void> {
    throw new Error('Switching account not supported');
  }

  async switchChain(chainId: ChainId): Promise<void> {
    throw new Error('Switching chain not supported');
  }
}
