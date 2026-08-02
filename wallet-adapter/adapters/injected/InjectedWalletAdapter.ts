import { WalletAdapter, Accounts, Account, WalletConfigs, AdapterId } from '../../core';
import { EIP6963ProviderDetail, EIP1193Provider } from './types';
import { createWalletClient, custom, WalletClient } from 'viem';

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
    await this.switchChain(this.supportedChains[0].id);

    const accounts: Accounts = await this._client.requestAddresses();
    this.updateAccounts(accounts);
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
    try {
      await this._client.switchChain({ id: chain.id });
    } catch (error: any) {
      if (error.code === 4902 && addChainIfNeeded) {
        try {
          await this._client.addChain({ chain });
          await this._clientSwitchChain(chainId);
        } catch (addError) {
          throw addError;
        }
      } else throw error;
    }
    this._client = createWalletClient({
      chain,
      transport: custom(this._provider!),
    });
    this.updateChain(chain.id);
  }

  async switchChain(chainId: number): Promise<void> {
    await this._clientSwitchChain(chainId, true);
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
