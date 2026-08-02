import { EventEmitter } from '../lib';
import {
  AdapterOption,
  ActiveAccount,
  AdapterInterface,
  Accounts,
  Account,
  Status,
  WalletAdapter,
  WalletConfigs,
} from '../core';
import { RegistryEvents, RegistryInterface } from './types';
import { Chain } from 'viem';

export class WalletRegistry extends EventEmitter<RegistryEvents> implements RegistryInterface {
  private readonly _adapters = new Map<string, WalletAdapter>();
  private readonly _adapterOptionOwners = new Map<string, string>();
  private _adapter: WalletAdapter | null = null;
  private _adapterSubscriptions: (() => void)[] = [];
  private _adapterOptionSubscriptions = new Map<string, () => void>();

  /**
   *
   * @param adapters WalletAdapter[] Duplicate adapter will be overridden (only unique adapter.id's are supported)
   */
  constructor(adapters: WalletAdapter[]) {
    super();
    if (adapters.length === 0) throw new Error('Empty wallet adapter array');
    if (adapters.length === 1) this._adapter = adapters[0];

    adapters.forEach((adapter) => {
      if (this._adapters.get(adapter.id)) {
        const unSubscribeOld = this._adapterOptionSubscriptions.get(adapter.id);
        if (unSubscribeOld) unSubscribeOld();
      }
      this._adapters.set(adapter.id, adapter);
      const unSubscribe = adapter.on('adapterOptionAdded', (adapterOption) =>
        this.addAdapterOption(adapter.id, adapterOption),
      );
      this._adapterOptionSubscriptions.set(adapter.id, unSubscribe);
    });
  }

  get status(): Status {
    return this._adapter?.status ?? 'disconnected';
  }

  get supportedChains(): readonly Chain[] {
    return this._adapter?.supportedChains ?? [];
  }

  get chainId(): number {
    return this._adapter?.chainId ?? 0;
  }

  get accounts(): Accounts {
    return this._adapter?.accounts ?? [];
  }

  get activeAccount(): ActiveAccount {
    return this._adapter?.activeAccount ?? null;
  }

  get adapterOptions(): readonly AdapterOption[] {
    return [...this._adapters.values().flatMap((a) => a.adapterOptions)];
  }

  get activeAdapter(): AdapterInterface | null {
    return this._adapter;
  }

  async initialize() {
    await Promise.all(Array.from(this._adapters.values()).map((adapter) => adapter.initialize()));
    const adapterOptionId = WalletConfigs.adapterOptionId;
    if (!adapterOptionId) return;
    const adapterId = this._adapterOptionOwners.get(adapterOptionId);
    if (!adapterId) return;
    const adapter = this._adapters.get(adapterId);
    if (!adapter) return;
    this.updateActiveAdapter(adapter);
    await this._adapter!.initialConnect(adapterOptionId);
  }

  async connect(adapterOptionId: string) {
    const adapterId = this._adapterOptionOwners.get(adapterOptionId);
    if (!adapterId) {
      throw new Error(`Adapter option with id ${adapterOptionId} not found`);
    }
    const adapter = this._adapters.get(adapterId);
    this.updateActiveAdapter(adapter!);
    await this._adapter!.connect(adapterOptionId);
    WalletConfigs.adapterOptionId = adapterOptionId;
  }

  async disconnect() {
    if (!this._adapter) {
      throw new Error('No active wallet to disconnect');
    }
    await this._adapter.disconnect();
  }

  async switchAccount(account: Account) {
    if (!this._adapter) {
      throw new Error('No active wallet to set account');
    }
    this._adapter.switchAccount(account);
  }

  async switchChain(chainId: number): Promise<void> {
    this._adapter?.switchChain(chainId);
  }

  private addAdapterOption(adapterId: string, adapterOption: AdapterOption) {
    this._adapterOptionOwners.set(adapterOption.id, adapterId);
    this.emit('adapterOptionAdded', adapterOption);
    this.emit('adapterOptionsUpdated', this.adapterOptions);
  }

  private updateActiveAdapter(adapter: AdapterInterface | null) {
    // Clean up previous subscriptions
    this._adapterSubscriptions.forEach((unsubscribe) => unsubscribe());
    this._adapterSubscriptions = [];

    this._adapter = adapter as WalletAdapter | null;

    // Subscribe to events from the new adapter
    if (this._adapter) {
      this._adapterSubscriptions = [
        this._adapter.on('statusUpdated', (status) => this.emit('statusUpdated', status)),
        this._adapter.on('chainIdUpdated', (chainId) => this.emit('chainIdUpdated', chainId)),
        this._adapter.on('accountsUpdated', (accounts) => this.emit('accountsUpdated', accounts)),
        this._adapter.on('accountUpdated', (account) => this.emit('accountUpdated', account)),
      ];
    }

    // Emit the adapterUpdated event
    this.emit('adapterUpdated', this._adapter);
  }
}
