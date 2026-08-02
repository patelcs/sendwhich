import { Chain } from 'viem';
import { EventEmitter } from '../lib';
import { AdapterInterface, AdapterEvents, AdapterOption, Accounts, Status, ActiveAccount, Account } from './types';
import { WalletConfigs } from './configs';
import { getAddress } from 'viem';

export abstract class WalletAdapter extends EventEmitter<AdapterEvents> implements AdapterInterface {
  private _status: Status = 'disconnected';
  private _chainId: number = 0;
  private _accounts: Accounts = [];
  private _account: ActiveAccount = null;
  private _adapterOptions = new Map<string, AdapterOption>();
  private readonly _supportedChains: Chain[];

  constructor(supportedChains: Chain[]) {
    super();
    this._supportedChains = supportedChains;
  }

  get status(): Status {
    return this._status;
  }

  get supportedChains(): readonly Chain[] {
    return this._supportedChains;
  }

  get chainId(): number {
    return this._chainId;
  }

  get accounts(): Accounts {
    return this._accounts;
  }

  get activeAccount(): ActiveAccount {
    return this._account;
  }

  get adapterOptions(): readonly AdapterOption[] {
    return [...this._adapterOptions.values()];
  }

  protected getChainById(chainId: number) {
    return this.supportedChains.find((c) => c.id == chainId);
  }

  protected updateStatus(status: Status) {
    this._status = status;
    this.emit('statusUpdated', this._status);
  }

  protected updateAccounts(accounts: Accounts, activeAccount?: ActiveAccount) {
    this._accounts = accounts.map((a) => getAddress(a)).toSorted();
    this.emit('accountsUpdated', this._accounts);

    this.updateAccount(accounts.length > 0 ? (activeAccount ?? getAddress(accounts[0])) : null);
    this.updateStatus(accounts.length > 0 ? 'connected' : 'disconnected');
  }

  protected addAdapterOption(adapterOption: AdapterOption) {
    this._adapterOptions.set(adapterOption.id, adapterOption);
    this.emit('adapterOptionAdded', adapterOption);
  }

  protected updateChain(chainId: number) {
    if (!this.getChainById(chainId)) throw new Error(`Chain with id ${chainId} is not supported`);
    this._chainId = chainId;
    WalletConfigs.chainId = chainId;
    this.emit('chainIdUpdated', this.chainId);
  }

  protected resetState() {
    this.updateStatus('disconnected');
    this.updateAccounts([]);
    this._account = null;
    this.emit('accountUpdated', this._account);
    WalletConfigs.reset();
  }

  protected updateAccount(account: ActiveAccount) {
    if (account && !this._accounts.includes(account)) {
      throw new Error(`Account ${account} is not in the list of available accounts`);
    }

    this._account = account;
    WalletConfigs.account = account;
    this.emit('accountUpdated', this._account);
  }

  abstract id: string;
  abstract name: string;
  abstract initialize(): Promise<void>;
  abstract initialConnect(adapterOptionId: string): Promise<void>;
  abstract connect(adapterOptionId: string): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract switchAccount(account: Account): Promise<void>;
  abstract switchChain(chainId: number): Promise<void>;
}
