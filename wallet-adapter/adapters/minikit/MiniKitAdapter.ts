import { initializeEruda } from '../../lib';
import { WalletAdapter, Account, AdapterId, WalletConfigs } from '../../core';
import { MiniKit } from '@worldcoin/minikit-js';
import type { CommandResultByVia, MiniKitWalletAuthOptions, WalletAuthResult } from '@worldcoin/minikit-js/commands';
import { worldchain } from 'viem/chains';

export class MiniKitAdapter extends WalletAdapter {
  private _appId?: string;
  private _installed = false;

  constructor(appId?: string) {
    super([worldchain]);
    this._appId = appId;
  }

  get id(): AdapterId {
    return 'minikit-wallet-adapter';
  }

  get name(): string {
    return 'MiniKit Wallet';
  }

  get isMinikitEnvironment() {
    return this._installed;
  }

  private install() {
    if (this._installed) return;
    const result = MiniKit.install(this._appId);
    this._installed = result.success || result.errorCode === 'app_out_of_date';
    if (!result.success) console.warn('MiniKit install:', result.errorCode, result.errorMessage);
  }

  async initialize() {
    // Load the debug console first so it's available even if MiniKit setup fails
    await initializeEruda().catch((error) => console.error('eruda initialization error:', error));
    this.install();
    if (!this.isMinikitEnvironment) throw new Error('Not in MiniApp Environment');
    if (this.adapterOptions.length === 1) return;
    try {
      this.addAdapterOption({
        id: 'minikit-wallet',
        name: 'MiniKit Wallet',
        icon: '',
      });
      this.updateChain(worldchain.id);
    } catch (error) {
      console.error('initialization error:', error);
    }
    this.updateStatus('initialized');
  }

  async initialConnect(adapterOptionId: string): Promise<void> {
    await this.connect(adapterOptionId);
  }

  async connect(adapterOptionId: string) {
    this.updateStatus('connecting');
    const input = {
      nonce: 'randomnonce123456',
    } satisfies MiniKitWalletAuthOptions;
    this.updateChain(worldchain.id);
    try {
      const result: CommandResultByVia<WalletAuthResult> = await MiniKit.walletAuth(input);
      const account = result.data.address as Account;
      WalletConfigs.adapterOptionId = adapterOptionId;
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
