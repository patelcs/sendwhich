import { EventEmitter } from "../lib";
import { WalletOption, WalletState, WalletInterface, Account } from "./types";
import { WalletAdapter, WALLET_STATE } from "./WalletAdapter";

export type ActiveWallet = WalletAdapter | null;

export interface RegistryEvents {
  stateUpdated: WalletState;
  walletsChanged: readonly WalletOption[];
  walletChanged: ActiveWallet;
}

export class WalletRegistry extends EventEmitter<RegistryEvents> implements WalletInterface {
  private _walletOptions = new Map<string, WalletOption>();
  private readonly _owners = new Map<string, WalletAdapter>();
  private _wallet: ActiveWallet = null;

  constructor(
    private readonly adapters: WalletAdapter[]
  ) {
    super();
    for (const adapter of adapters) {
      adapter.on("walletsUpdated", walletOptions => this.addWalletOptions(adapter, walletOptions));
      adapter.on("stateUpdated", state => this.emit("stateUpdated", state));
      this.addWalletOptions(adapter, adapter.walletOptions);
    }
  }

  get activeWallet(): ActiveWallet {
    return this._wallet;
  }

  private setActiveWallet(wallet: ActiveWallet) {
    this._wallet?.off("stateUpdated", this.updateState);
    this._wallet = wallet;
    this._wallet?.on("stateUpdated", this.updateState);
    this.emit("walletChanged", wallet);
  }

  initialize = async () => {
    await Promise.all(
      this.adapters.map(adapter => adapter.initialize())
    );
  }

  private addWalletOptions = (adapter: WalletAdapter, walletOptions: readonly WalletOption[]) => {
    walletOptions.forEach(walletOption => {
      this._walletOptions.set(walletOption.id, walletOption);
      this._owners.set(walletOption.id, adapter);
    });
    this.emit("walletsChanged", this.walletOptions);
  }

  get walletOptions(): readonly WalletOption[] {
    return [...this._walletOptions.values()];
  }

  get state(): WalletState {
    return this._wallet?.state ?? WALLET_STATE;
  }

  connect = async (id: string) => {
    const adapter = this._owners.get(id);
    if (!adapter) {
      throw new Error(`Wallet with id ${id} not found`);
    }
    this.setActiveWallet(adapter);
    await adapter.connect(id);
  }

  disconnect = async () => {
    if (!this._wallet) {
      throw new Error("No active wallet to disconnect");
    }
    await this._wallet.disconnect();
    this.setActiveWallet(null);
  }

  setAccount = (account: Account) => {
    if (!this._wallet) {
      throw new Error("No active wallet to set account");
    }
    this._wallet.setAccount(account);
  }

  updateState = (state: WalletState) => {
    this.emit("stateUpdated", state);
  }
}
