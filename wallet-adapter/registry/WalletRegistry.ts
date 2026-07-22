import { EventEmitter } from '../lib';
import {
  WalletOption,
  ActiveAccount,
  WalletEvents,
  AdapterInterface,
  Accounts,
  Account,
  Status,
  WalletAdapter,
  ChainId,
  type AdapterOptions,
} from '../core';

export type RegistryOptions<Configs> = AdapterOptions<Configs> & {
  adapters: WalletAdapter<Configs>[];
};

export class WalletRegistry<Configs = unknown>
  extends EventEmitter<WalletEvents<Configs>>
  implements AdapterInterface<Configs>
{
  private _configs!: Configs;
  private _wallet: WalletAdapter<Configs> | null = null;
  private readonly _adapters: WalletAdapter<Configs>[];

  constructor(options: RegistryOptions<Configs>) {
    super();
    if (options.adapters.length === 0)
      throw new Error('Empty wallet adapter array');
    this._adapters = options.adapters;
    if (this._adapters.length === 1) this._wallet = this._adapters[0];
    this._adapters.forEach((a) =>
      a.on('walletAdded', (w) => this.emit('walletAdded', w)),
    );
    if ('configs' in options) this._configs = options.configs;
  }

  get configs(): unknown extends Configs ? unknown : Configs {
    return this._wallet?.configs ?? this._configs;
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

  async switchChain(chainId: ChainId): Promise<void> {
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
