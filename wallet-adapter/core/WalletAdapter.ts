import { Chain } from 'viem';
import { EventEmitter } from '../lib';
import {
  AdapterInterface,
  WalletEvents,
  WalletOption,
  Accounts,
  Status,
  ActiveAccount,
  Account,
} from './types';
import { WalletConfigs } from './configs';

export abstract class WalletAdapter
  extends EventEmitter<WalletEvents>
  implements AdapterInterface {
  private _status: Status = 'disconnected';
  private _chainId: number = 0;
  private _accounts: Accounts = [];
  private _account: ActiveAccount = null;
  private _walletOptions = new Map<string, WalletOption>();
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

  get walletOptions(): readonly WalletOption[] {
    return [...this._walletOptions.values()];
  }

  protected getConnectedOrDefaultChain() {
    const chainId = WalletConfigs.chainId;
    return this.supportedChains.find(c => c.id == chainId) ?? this.supportedChains[0];
  }

  protected updateStatus(status: Status) {
    this._status = status;
    this.emit('statusUpdated', this._status);
  }

  protected updateAccounts(accounts: Accounts, activeAccount?: ActiveAccount) {
    this._accounts = accounts.toSorted();
    this.emit('accountsUpdated', this._accounts);

    this.updateAccount(accounts.length > 0 ? (activeAccount ?? accounts[0]) : null);
    this.updateStatus(accounts.length > 0 ? 'connected' : 'disconnected');
  }

  protected addWalletOption(walletOption: WalletOption) {
    this._walletOptions.set(walletOption.id, walletOption);
    this.emit('walletAdded', walletOption);
  }

  protected updateChain(chainId: number) {
    if (!this.supportedChains.find(c => c.id == chainId)) throw new Error(`Chain with id ${chainId} is not supported`);
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
      throw new Error(
        `Account ${account} is not in the list of available accounts`,
      );
    }

    this._account = account;
    WalletConfigs.account = account;
    this.emit('accountUpdated', this._account);
  }

  abstract initialize(): Promise<void>;
  abstract initialConnect(walletId: string): Promise<void>;
  abstract connect(walletId: string): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract switchAccount(account: Account): Promise<void>;
  abstract switchChain(chainId: number): Promise<void>;
}
