import {
  WalletAdapter,
  Accounts,
  Account,
  WalletConfigs,
  AdapterId,
  SentTransaction,
  TransactionError,
  TransactionRequest,
} from '../../core';
import { EIP6963ProviderDetail, EIP1193Provider } from './types';
import { createWalletClient, custom, Hex, WalletClient } from 'viem';
import { toTransactionError } from './errors';

export class InjectedWalletAdapter extends WalletAdapter {
  private readonly _providers = new Map<string, EIP1193Provider>();
  private _client: WalletClient | null = null;
  private _provider: EIP1193Provider | null = null;

  get id(): AdapterId {
    return 'injected-wallet-adapter';
  }

  get name(): string {
    return 'Injected Wallet';
  }

  async initialize() {
    window.addEventListener('eip6963:announceProvider', this.onAnnounceProvider);
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    this.updateStatus('initialized');
  }

  async initialConnect(adapterOptionId: string): Promise<void> {
    console.debug(`Attempting initial connect to wallet with id ${adapterOptionId}`);
    const provider = this._providers.get(adapterOptionId);
    if (!provider) return;
    this.updateStatus('connecting');
    this._provider = provider;
    this._client = createWalletClient({
      transport: custom(provider),
    });
    this.registerProviderEvents();
    let chainConnected = false;
    try {
      const savedChainId = WalletConfigs.chainId;
      if (!savedChainId) throw new Error('No saved chain id found');
      await this._clientSwitchChain(savedChainId);
      chainConnected = true;
      console.debug(`Initial connect successful to chain ${savedChainId}`);
    } catch (error) {
      const connectedChainId = await this._client.getChainId();
      if (connectedChainId) {
        try {
          await this._clientSwitchChain(connectedChainId, false);
          chainConnected = true;
          console.debug(`Initial connect successful to fallback connected chain ${connectedChainId}`);
        } catch (fallbackSwitchError) {
          console.debug(`Failed to switch to fallback connected chain ${connectedChainId}:`, fallbackSwitchError);
        }
      }
    }
    if (!chainConnected) {
      try {
        await this.disconnect();
        console.debug('Disconnected after failed initial connect to fallback connected chain');
      } catch (failedDisconnectError) {
        console.debug(
          'Failed to disconnect after failed initial connect to fallback connected chain:',
          failedDisconnectError,
        );
        this.updateAccounts([]);
      }
      return; // Return early to avoid further processing
    }
    const accounts: Accounts = await this._client.getAddresses();
    this.updateAccounts(accounts, WalletConfigs.account);
  }

  async connect(adapterOptionId: string) {
    const provider = this._providers.get(adapterOptionId);
    if (!provider) {
      throw new Error(`Provider with id ${adapterOptionId} not found`);
    }
    this.updateStatus('connecting');
    this._provider = provider;
    this._client = createWalletClient({
      chain: this.supportedChains[0],
      transport: custom(provider),
    });
    this.registerProviderEvents();

    try {
      const accounts: Accounts = await this._client.requestAddresses();
      WalletConfigs.adapterOptionId = adapterOptionId;
      await this.switchChain(this.supportedChains[0].id);
      this.updateAccounts(accounts);
    } catch (error) {
      console.error('Wallet connect error:', error);
      this.updateStatus('disconnected');
    }
  }

  async disconnect() {
    if (!this._client) {
      throw new Error('Wallet client is not initialized');
    }
    try {
      await this._client.transport.request({
        method: 'wallet_revokePermissions',
        params: [
          {
            eth_accounts: {},
          },
        ],
      });
    } catch {
      // Some wallets don't support it.
      this.onDisconnect();
    }
  }

  async switchAccount(account: Account) {
    this.updateAccount(account);
  }

  private async _clientSwitchChain(chainId: number, addChainIfNeeded?: boolean): Promise<void> {
    if (!this._client) {
      throw new Error('Wallet client is not initialized');
    }
    const chain = this.getChainById(chainId);
    if (!chain) {
      throw new Error(`Chain with id ${chainId} is not supported`);
    }
    if (!this._client) {
      throw new Error('Wallet client is not initialized');
    }
    const oldStatus = this.status;
    this.updateStatus('connecting');
    try {
      await this._client.switchChain({ id: chain.id });
    } catch (error: any) {
      if (error.code === 4902 && addChainIfNeeded) {
        try {
          await this._client.addChain({ chain });
          await this._clientSwitchChain(chainId);
        } catch (addError) {
          console.error('chain add error:', addError);
          this.updateStatus(oldStatus);
        }
      } else {
        console.error('switch chain error:', error);
        this.updateStatus(oldStatus);
      }
    }
    this._client = createWalletClient({
      chain,
      transport: custom(this._provider!),
    });
    this.updateChain(chain.id);
    this.updateStatus('connected');
  }

  async switchChain(chainId: number): Promise<void> {
    await this._clientSwitchChain(chainId, true);
  }

  async sendTransaction(request: TransactionRequest): Promise<SentTransaction> {
    this.assertSendable(request);
    const { chainId, calls } = request;
    if (!this._client) throw new TransactionError('NotConnected', 'Connect your wallet first');

    if (this.chainId !== chainId) await this.switchChain(chainId);
    // switchChain swallows wallet errors, so confirm what the wallet is actually on.
    const walletChainId = await this._client.getChainId();
    const chain = this.getChainById(chainId)!;
    if (walletChainId !== chainId) {
      throw new TransactionError(
        'ChainMismatch',
        `Switch your wallet to ${chain.name}`,
        `Wallet is on chain ${walletChainId}, transaction needs ${chainId}`,
      );
    }

    const account = this.activeAccount!;
    let hash: Hex | undefined;
    // Wallets take one call per transaction. Later calls may depend on earlier ones (e.g. approve → spend),
    // so each one must be mined before the next is sent.
    for (const [index, call] of calls.entries()) {
      if (hash) await this.waitForReceipt(chainId, hash);
      console.info(`[${this.id}] sending call ${index + 1}/${calls.length}`, { chainId, account, call });
      try {
        hash = await this._client.sendTransaction({ account, chain, to: call.to, data: call.data, value: call.value });
      } catch (error) {
        const txError = toTransactionError(error);
        console.error(`[${this.id}] send failed`, { code: txError.code, hint: txError.hint, call, error });
        throw txError;
      }
      console.info(`[${this.id}] submitted`, { hash });
    }

    const finalHash = hash!;
    return { id: finalHash, wait: () => this.waitForReceipt(chainId, finalHash) };
  }

  protected resetState(): void {
    super.resetState();
    this._client = null;
    this._provider = null;
  }

  private registerProviderEvents() {
    if (!this._provider) {
      throw new Error('Provider is not initialized');
    }
    this._provider.on('accountsChanged', this.onAccountsChanged);
    // this._provider.on('chainChanged', this.onChainChanged);
    this._provider.on('disconnect', this.onDisconnect);
  }

  private readonly onAnnounceProvider = (event: CustomEvent<EIP6963ProviderDetail>) => {
    const { info, provider } = event.detail;
    const adapterOptionId = `${this.id}::${info.name}`;
    this._providers.set(adapterOptionId, provider);
    this.addAdapterOption({
      id: adapterOptionId,
      name: info.name,
      icon: info.icon,
    });
  };

  private readonly onAccountsChanged = (accounts: Accounts) => {
    this.updateAccounts(accounts);
  };

  // private readonly onChainChanged = (chainId: string) => {
  //   this.updateChain(Number(chainId));
  // };

  private readonly onDisconnect = () => {
    if (!this._provider) {
      throw new Error('Provider is not initialized');
    }
    this._provider.removeListener('accountsChanged', this.onAccountsChanged);
    // this._provider.removeListener('chainChanged', this.onChainChanged);
    this._provider.removeListener('disconnect', this.onDisconnect);
    this.resetState();
  };
}
