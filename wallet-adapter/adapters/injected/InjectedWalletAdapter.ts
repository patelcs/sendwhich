import {
  WalletAdapter,
  Accounts,
  UIConfigs,
  Account,
  ChainId,
} from '../../core';
import { EIP6963ProviderDetail, EIP1193Provider } from './types';
import { createWalletClient, custom, WalletClient } from 'viem';
import { mainnet } from 'viem/chains';

export class InjectedWalletAdapter extends WalletAdapter {
  private readonly _providers = new Map<string, EIP1193Provider>();
  private _provider: EIP1193Provider | undefined = undefined;
  private _client: WalletClient | null = null;

  constructor() {
    super();
  }

  get uiConfigs(): UIConfigs {
    return {
      mobileNavbarType: 'DropDown',
    };
  }

  async initialize() {
    window.addEventListener(
      'eip6963:announceProvider',
      this.onAnnounceProvider,
    );
    window.dispatchEvent(new Event('eip6963:requestProvider'));
  }

  async connect(walletId: string) {
    this._provider = this._providers.get(walletId);
    if (!this._provider) {
      throw new Error(`Provider with id ${walletId} not found`);
    }

    const accounts: Accounts = await this._provider.request({
      method: 'eth_requestAccounts',
    });
    this.updateAccounts(accounts);

    this._client = createWalletClient({
      account: accounts[0],
      chain: mainnet,
      transport: custom(this._provider),
    });

    this.registerProviderEvents();
  }

  async disconnect() {
    if (this._provider?.on) {
      try {
        await this._provider.request({
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
        this._provider.removeListener(
          'accountsChanged',
          this.onAccountsChanged,
        );
        this._provider.removeListener('chainChanged', this.onChainChanged);
        this._provider.removeListener('disconnect', this.onDisconnect);
      }
    }
    this.resetState();
  }

  async switchAccount(account: Account) {
    this.updateAccount(account);
  }

  async switchChain(chainId: ChainId): Promise<void> {
    // TODO: add code to change chain in injected provider
    this.updateChain(chainId);
  }

  protected resetState(): void {
    super.resetState();
    this._client = null;
    this._provider = undefined;
  }

  private registerProviderEvents() {
    if (!this._provider?.on) return;
    this._provider.on('accountsChanged', this.onAccountsChanged);
    this._provider.on('chainChanged', this.onChainChanged);
    this._provider.on('disconnect', this.onDisconnect);
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
