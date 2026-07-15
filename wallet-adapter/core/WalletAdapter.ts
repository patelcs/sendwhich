import { EventEmitter } from '../lib';
import { WalletInterface, WalletEvents, UIConfigs, WalletOption, Accounts, WalletState, Account } from './types';

export const UI_CONFIGS: UIConfigs = {
  mobileNavbarType: 'DropDown',
} as const;

export const WALLET_STATE: WalletState = {
  uiConfigs: UI_CONFIGS,
  status: 'disconnected',
  accounts: [],
  account: null,
};

export abstract class WalletAdapter extends EventEmitter<WalletEvents> implements WalletInterface {

  private _state: WalletState = WALLET_STATE;
  private _walletOptions = new Map<string, WalletOption>();


  get state() {
    return this._state;
  }

  get walletOptions(): readonly WalletOption[] {
    return [...this._walletOptions.values()];
  }

  private buildNextState = (state: Partial<WalletState>): WalletState => {
    const nextAccounts = state.accounts ?? this._state.accounts;
    const hasConnectedAccounts = nextAccounts.length > 0;
    const resolvedAccount =
      state.account ??
      (this._state.account && nextAccounts.includes(this._state.account)
        ? this._state.account
        : nextAccounts[0] ?? null);

    return {
      ...this._state,
      ...state,
      accounts: nextAccounts,
      account: resolvedAccount,
      status: state.status ?? (hasConnectedAccounts ? 'connected' : 'disconnected'),
    };
  }

  protected updateState = (state: Partial<WalletState>) => {
    this._state = this.buildNextState(state);
    this.emit('stateUpdated', this._state);
  }

  protected addWalletOption = (walletOption: WalletOption) => {
    this._walletOptions.set(walletOption.id, walletOption);
    this.emit('walletsUpdated', this.walletOptions);
  }

  setAccount = (account: Account) => {
    this._state = this.buildNextState({ account, status: 'connected' });
    this.emit('stateUpdated', this._state);
  }

  abstract initialize: () => Promise<void>;
  abstract connect: (walletId: string) => Promise<void>;
  abstract disconnect: () => Promise<void>;
}
