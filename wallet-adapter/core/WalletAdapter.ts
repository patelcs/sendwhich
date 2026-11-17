import { Chain } from 'viem';
import { EventEmitter } from '../lib';
import {
  AdapterInterface,
  AdapterEvents,
  AdapterOption,
  Accounts,
  Status,
  ActiveAccount,
  Account,
  AdapterId,
} from './types';
import { WalletConfigs } from './configs';
import { createPublicClient, fallback, getAddress, http, type Hex, type PublicClient } from 'viem';
import { SentTransaction, TransactionError, TransactionRequest } from './transaction';

export abstract class WalletAdapter extends EventEmitter<AdapterEvents> implements AdapterInterface {
  private _status: Status = 'initializing';
  private _chainId: number = 1;
  private _accounts: Accounts = [];
  private _account: ActiveAccount = null;
  private _adapterOptions = new Map<string, AdapterOption>();
  private readonly _supportedChains: Chain[];
  private readonly _publicClients = new Map<number, PublicClient>();

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

  /** Read-only client for `chainId`, using the chain's own `rpcUrls.default` list (with fallback). */
  protected getPublicClient(chainId: number): PublicClient {
    const cached = this._publicClients.get(chainId);
    if (cached) return cached;
    const chain = this.getChainById(chainId);
    if (!chain) throw new TransactionError('ChainMismatch', `Chain with id ${chainId} is not supported`);
    const client = createPublicClient({
      chain,
      transport: fallback(chain.rpcUrls.default.http.map((url) => http(url))),
    }) as PublicClient;
    this._publicClients.set(chainId, client);
    return client;
  }

  /** Waits for `hash` to be mined and throws if it reverted. */
  protected async waitForReceipt(chainId: number, hash: Hex): Promise<Hex> {
    console.info(`[${this.id}] waiting for receipt`, { chainId, hash });
    let receipt;
    try {
      receipt = await this.getPublicClient(chainId).waitForTransactionReceipt({ hash });
    } catch (error) {
      console.error(`[${this.id}] receipt lookup failed`, { chainId, hash, error });
      throw new TransactionError('Timeout', 'Could not confirm the transaction', `Transaction ${hash} was not confirmed`, {
        cause: error,
      });
    }
    console.info(`[${this.id}] receipt`, { chainId, hash, status: receipt.status, block: receipt.blockNumber });
    if (receipt.status === 'reverted') {
      throw new TransactionError('Reverted', 'Transaction reverted', `Transaction ${hash} reverted on-chain`);
    }
    return hash;
  }

  protected assertSendable({ chainId, calls }: TransactionRequest) {
    if (!this.activeAccount) throw new TransactionError('NotConnected', 'Connect your wallet first');
    if (calls.length === 0) throw new TransactionError('InvalidRequest', 'Nothing to send');
    if (!this.getChainById(chainId)) {
      throw new TransactionError('ChainMismatch', `Chain with id ${chainId} is not supported by ${this.name}`);
    }
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
    if (!account) this.updateStatus('disconnected');
    this.emit('accountUpdated', this._account);
  }

  abstract id: AdapterId;
  abstract name: string;
  abstract initialize(): Promise<void>;
  abstract initialConnect(adapterOptionId: string): Promise<void>;
  abstract connect(adapterOptionId: string): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract switchAccount(account: Account): Promise<void>;
  abstract switchChain(chainId: number): Promise<void>;
  abstract sendTransaction(request: TransactionRequest): Promise<SentTransaction>;
}
