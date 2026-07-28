import { WalletAdapter, Accounts, Account } from '../../core';
import { EIP6963ProviderDetail, EIP1193Provider } from './types';
import { createWalletClient, custom, WalletClient } from 'viem';
import { mainnet } from 'viem/chains';

export class InjectedWalletAdapter extends WalletAdapter {
  private readonly _providers = new Map<string, EIP1193Provider>();
  private _client: WalletClient | null = null;
  private _provider: EIP1193Provider | null = null;

  async initialize() {
    window.addEventListener(
      'eip6963:announceProvider',
      this.onAnnounceProvider,
    );
    window.dispatchEvent(new Event('eip6963:requestProvider'));
  }

  async connect(walletId: string) {
    const provider = this._providers.get(walletId);
    if (!provider) {
      throw new Error(`Provider with id ${walletId} not found`);
    }
    this.updateStatus('connecting');
    this._provider = provider;
    this._client = createWalletClient({
      chain: mainnet,
      transport: custom(provider),
    });
    this.registerProviderEvents();

    const accounts: Accounts = await this._client.requestAddresses();
    this.updateAccounts(accounts);
  }

  async disconnect() {
    try {
      await this._client?.transport.request({
        method: 'wallet_revokePermissions',
        params: [
          {
            eth_accounts: {},
          },
        ],
      });
    } catch {
      // Some wallets don't support it.
    } finally {
      this._provider?.removeListener('accountsChanged', this.onAccountsChanged);
      this._provider?.removeListener('chainChanged', this.onChainChanged);
      this._provider?.removeListener('disconnect', this.onDisconnect);
    }
    this.resetState();
  }

  async switchAccount(account: Account) {
    this.updateAccount(account);
  }

  async switchChain(chainId: number): Promise<void> {
    this._client?.switchChain({ id: chainId });
    this.updateChain(chainId);
  }

  protected resetState(): void {
    super.resetState();
    this._client = null;
    this._provider = null;
  }

  private registerProviderEvents() {
    this._provider?.on('accountsChanged', this.onAccountsChanged);
    this._provider?.on('chainChanged', this.onChainChanged);
    this._provider?.on('disconnect', this.onDisconnect);
  }

  private readonly onAnnounceProvider = (
    event: CustomEvent<EIP6963ProviderDetail>,
  ) => {
    const { info, provider } = event.detail;
    this._providers.set(info.uuid, provider);
    this.addWalletOption({
      id: info.uuid,
      name: info.name,
      icon: info.icon,
    });
  };

  private readonly onAccountsChanged = (accounts: Accounts) => {
    this.updateAccounts(accounts);
  };

  private readonly onChainChanged = (chainId: string) => {
    this.updateChain(Number(chainId));
  };

  private readonly onDisconnect = () => {
    this.resetState();
  };
}
