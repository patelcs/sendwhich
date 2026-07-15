export interface UIConfigs {
  mobileNavbarType: 'DropDown' | 'Bottom';
}

export type Status = 'disconnected' | 'connecting' | 'connected';

export type Account = `0x${string}`;
export type ActiveAccount = Account | null;
export type Accounts = readonly Account[];

export interface WalletOption {
  id: string;
  name: string;
  icon: string;
}

export interface WalletState {
  uiConfigs: UIConfigs;
  status: Status;
  accounts: Accounts;
  account: ActiveAccount;
}

export interface WalletEvents {
  stateUpdated: WalletState;
  walletsUpdated: readonly WalletOption[];
}

export interface WalletInterface {
  connect: (walletId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  setAccount: (account: Account) => void;
  state: WalletState;
  walletOptions: readonly WalletOption[];
}