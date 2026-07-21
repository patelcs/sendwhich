import { EventEmitter } from '../lib';
import {
  WalletOption,
  ActiveAccount,
  WalletEvents,
  AdapterInterface,
  Accounts,
  Account,
  Status,
  UIConfigs,
  UI_CONFIGS,
  WalletAdapter,
  ChainId,
} from '../core';

export type ActiveWallet = WalletAdapter | null;

export class WalletRegistry
  extends EventEmitter<WalletEvents>
  implements AdapterInterface
{
  private _wallet: ActiveWallet = null;

  constructor(private readonly adapters: WalletAdapter[]) {
    super();
    if (adapters.length === 0) throw new Error('Empty wallet adapter array');
    if (adapters.length === 1) this._wallet = adapters[0];
    this.adapters.forEach((a) =>
      a.on('walletAdded', (w) => this.emit('walletAdded', w)),
    );
  }

  get uiConfigs(): UIConfigs {
    return this._wallet?.uiConfigs ?? UI_CONFIGS;
  }

  get status(): Status {
    return this._wallet?.status ?? 'disconnected';
  }

  get chainId(): ChainId {
    return this._wallet?.chainId ?? 0;
  }

  get accounts(): Accounts {
    return this._wallet?.accounts ?? [];
  }

  get activeAccount(): ActiveAccount {
    return this._wallet?.activeAccount ?? null;
  }

  get walletOptions(): readonly WalletOption[] {
    return this.adapters.flatMap((a) => a.walletOptions);
  }

  async initialize() {
    await Promise.all(this.adapters.map((adapter) => adapter.initialize()));
  }

  async connect(walletId: string) {
    const adapter = this.findAdapter(walletId);
    if (!adapter) {
      throw new Error(`Wallet with id ${walletId} not found`);
    }
    this._wallet?.removeReEmitter(this);
    this._wallet = adapter;
    this._wallet.addReEmitter(this);
    await adapter.connect(walletId);
  }

  async disconnect() {
    if (!this._wallet) {
      throw new Error('No active wallet to disconnect');
    }
    await this._wallet.disconnect();
  }

  async switchAccount(account: Account) {
    if (!this._wallet) {
      throw new Error('No active wallet to set account');
    }
    this._wallet.switchAccount(account);
  }

  async switchChain(chainId: ChainId): Promise<void> {
    this._wallet?.switchChain(chainId);
  }

  private findAdapter(walletId: string) {
    for (const adapter of this.adapters) {
      for (const walletOption of adapter.walletOptions) {
        if (walletOption.id === walletId) return adapter;
      }
    }
    return null;
  }
}
