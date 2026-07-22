import { EventEmitter } from '../lib';
import {
  AdapterInterface,
  WalletEvents,
  WalletOption,
  Accounts,
  Status,
  ActiveAccount,
  Account,
  ChainId,
} from './types';

export type AdapterOptions<Configs> = unknown extends Configs
  ? {}
  : { configs: Configs };

export abstract class WalletAdapter<Configs = unknown>
  extends EventEmitter<WalletEvents<Configs>>
  implements AdapterInterface<Configs>
{
  private _configs!: Configs;
  private _status: Status = 'disconnected';
  private _chainId: ChainId = 0;
  private _accounts: Accounts = [];
  private _account: ActiveAccount = null;
  private _walletOptions = new Map<string, WalletOption>();

  constructor(options: AdapterOptions<Configs>) {
    super();
    if ('configs' in options) this._configs = options.configs;
  }

  get configs(): unknown extends Configs ? unknown : Configs {
    return this._configs;
  }

  get status(): Status {
    return this._status;
  }

  get chainId(): ChainId {
    return this._chainId;
  }

  get accounts(): Accounts {
    return this._accounts;
  }

  get activeAccount(): ActiveAccount {
    return this._account;
  }

  get walletOptions(): readonly WalletOption[] {
    return [...this._walletOptions.values()];
  }

  protected updateStatus(status: Status) {
    this._status = status;
    this.emit('statusUpdated', this._status);
  }

  protected updateChainId(chainId: ChainId) {
    this._chainId = chainId;
    this.emit('chainIdUpdated', this._chainId);
  }

  protected updateAccounts(accounts: Accounts) {
    this._account = accounts.length > 0 ? accounts[0] : null;
    this.emit('accountUpdated', this._account);

    this._accounts = accounts.toSorted();
    this.emit('accountsUpdated', this._accounts);

    this._status = accounts.length > 0 ? 'connected' : 'disconnected';
    this.emit('statusUpdated', this._status);
  }

  protected addWalletOption(walletOption: WalletOption) {
    this._walletOptions.set(walletOption.id, walletOption);
    this.emit('walletAdded', walletOption);
  }

  protected updateChain(chainId: ChainId) {
    this._chainId = chainId;
    this.emit('chainIdUpdated', this.chainId);
  }

  protected resetState() {
    this.updateStatus('disconnected');
    this.updateAccounts([]);
    this._account = null;
    this.emit('accountUpdated', this._account);
  }

  protected updateAccount(account: Account) {
    if (!this._accounts.includes(account)) {
      throw new Error(
        `Account ${account} is not in the list of available accounts`,
      );
    }

    this._account = account;
    this.emit('accountUpdated', this._account);
  }

  abstract initialize(): Promise<void>;
  abstract connect(walletId: string): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract switchAccount(account: Account): Promise<void>;
  abstract switchChain(chainId: ChainId): Promise<void>;
}
