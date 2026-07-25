import { EventEmitter } from '../lib';
import {
  WalletOption,
  ActiveAccount,
  WalletEvents,
  AdapterInterface,
  Accounts,
  Account,
  Status,
  WalletAdapter
} from '../core';
import { Chain } from 'viem';

export class WalletRegistry
  extends EventEmitter<WalletEvents>
  implements AdapterInterface {
  private _wallet: WalletAdapter | null = null;
  constructor(private readonly _adapters: WalletAdapter[]) {
    super();
    if (this._adapters.length === 0)
      throw new Error('Empty wallet adapter array');
    if (this._adapters.length === 1) this._wallet = this._adapters[0];
    this._adapters.forEach((a) =>
      a.on('walletAdded', (w) => this.emit('walletAdded', w)),
    );
  }

  get status(): Status {
    return this._wallet?.status ?? 'disconnected';
  }

  get supportedChains(): readonly Chain[] {
    return this._wallet?.supportedChains ?? [];
  }

  get chainId(): number {
    return this._wallet?.chainId ?? 0;
  }

  get accounts(): Accounts {
    return this._wallet?.accounts ?? [];
  }

  get activeAccount(): ActiveAccount {
    return this._wallet?.activeAccount ?? null;
  }

  get walletOptions(): readonly WalletOption[] {
    return this._adapters.flatMap((a) => a.walletOptions);
  }

  async initialize() {
    await Promise.all(this._adapters.map((adapter) => adapter.initialize()));
  }

  async connect(walletId: string) {
    const adapter = this.findAdapter(walletId);
    if (!adapter) {
      throw new Error(`Wallet with id ${walletId} not found`);
    }
    this._wallet?.removeReEmitter(this);
    this._wallet = adapter;
    this._wallet!.addReEmitter(this);
    await this._wallet!.connect(walletId);
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

  async switchChain(chainId: number): Promise<void> {
    this._wallet?.switchChain(chainId);
  }

  private findAdapter(walletId: string) {
    for (const adapter of this._adapters) {
      for (const walletOption of adapter.walletOptions) {
        if (walletOption.id === walletId) return adapter;
      }
    }
    return null;
  }
}
