import { initializeEruda } from '../../lib';
import { WalletAdapter, Account, AdapterId } from '../../core';
import { MiniKit } from '@worldcoin/minikit-js';
import type { CommandResultByVia, MiniKitWalletAuthOptions, WalletAuthResult } from '@worldcoin/minikit-js/commands';
import { worldchain } from 'viem/chains';

export class MiniKitAdapter extends WalletAdapter {
  private _installSuccess: boolean;

  constructor(appId?: string) {
    super([worldchain]);
    const { success } = MiniKit.install(appId);
    this._installSuccess = success;
  }

  get id(): AdapterId {
    return 'minikit-wallet-adapter';
  }

  get name(): string {
    return 'MiniKit Wallet';
  }

  get isMinikitEnvironment() {
    return this._installSuccess;
  }

  async initialize() {
    if (!this.isMinikitEnvironment) throw new Error('Not in MiniApp Environment');
    if (this.adapterOptions.length === 1) return;
    try {
      this.addAdapterOption({
        id: 'minikit-wallet',
        name: 'MiniKit Wallet',
        icon: '',
      });
      this.updateChain(worldchain.id);
      await initializeEruda();
    } catch (error) {
      console.error('initialization error:', error);
    }
  }

  async initialConnect(adapterOptionId: string): Promise<void> {
    await this.connect(adapterOptionId);
  }

  async connect(adapterOptionId: string) {
    const input = {
      nonce: 'randomnonce123456',
    } satisfies MiniKitWalletAuthOptions;
    this.updateChain(worldchain.id);
    try {
      const result: CommandResultByVia<WalletAuthResult> = await MiniKit.walletAuth(input);
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

  async switchChain(chainId: number): Promise<void> {
    throw new Error('Switching chain not supported');
  }
}
