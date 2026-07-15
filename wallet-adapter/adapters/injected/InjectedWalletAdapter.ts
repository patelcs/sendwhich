import { WalletAdapter, Accounts } from '../../core';
import { EIP6963ProviderDetail, EIP1193Provider } from './types'
import { createWalletClient, custom, WalletClient } from 'viem'
import { mainnet } from 'viem/chains'

export class InjectedWalletAdapter extends WalletAdapter {

  private readonly _providers = new Map<string, EIP1193Provider>();
  private _provider: EIP1193Provider | undefined = undefined;
  private _client: WalletClient | null = null;

  initialize = async () => {
    window.addEventListener("eip6963:announceProvider", this.onAnnounceProvider);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
  }

  private readonly onAnnounceProvider = (
    event: CustomEvent<EIP6963ProviderDetail>
  ) => {
    const { info, provider } = event.detail;
    this._providers.set(info.uuid, provider);
    this.addWalletOption({
      id: info.uuid,
      name: info.name,
      icon: info.icon
    });
    console.log(`Injected provider announced: ${info.name} (${info.uuid})`);
  };

  connect = async (walletId: string) => {
    this._provider = this._providers.get(walletId);
    if (!this._provider) {
      throw new Error(`Provider with id ${walletId} not found`);
    }

    const accounts = await this._provider.request({ method: 'eth_requestAccounts' });
    this.updateState({ accounts });

    this._client = createWalletClient({
      account: accounts[0],
      chain: mainnet,
      transport: custom(this._provider)
    });

    this.registerProviderEvents();
  }

  disconnect = async () => {
    if (!this._provider?.on) {
      this.updateState({ status: 'disconnected', accounts: [], account: null });
      this._client = null;
      this._provider = undefined;
      return;
    }

    try {
      await this._provider.request({
        method: "wallet_revokePermissions",
        params: [
          {
            eth_accounts: {},
          },
        ],
      });
    } catch {
      // Some wallets don't support it.
    } finally {
      this._provider.removeListener('accountsChanged', this.onAccountsChanged);
      this._provider.removeListener("chainChanged", this.onChainChanged);
      this._provider.removeListener('disconnect', this.onDisconnect);
      this.updateState({ status: 'disconnected', accounts: [], account: null });
      this._client = null;
      this._provider = undefined;
    }
  }

  private registerProviderEvents = () => {
    if (!this._provider?.on) return;
    this._provider.on('accountsChanged', this.onAccountsChanged);
    this._provider.on("chainChanged", this.onChainChanged);
    this._provider.on('disconnect', this.onDisconnect);
  }

  private readonly onAccountsChanged = (accounts: Accounts) => {
    this.updateState({ accounts });
  };

  private readonly onChainChanged = (_chainId: string) => {
    // Handle chain change if needed
  };

  private readonly onDisconnect = () => {
    this.updateState({ status: 'disconnected', accounts: [], account: null });
    this._client = null;
    this._provider = undefined;
  };
}
