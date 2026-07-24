export type Status = 'disconnected' | 'connecting' | 'connected';
export type Account = `0x${string}`;
export type ActiveAccount = Account | null;
export type Accounts = readonly Account[];
export type ChainId = number;

export interface WalletOption {
  id: string;
  name: string;
  icon: string;
}

export interface WalletEvents {
  statusUpdated: Status;
  chainIdUpdated: ChainId;
  accountsUpdated: Accounts;
  accountUpdated: ActiveAccount;
  walletAdded: WalletOption;
}

export interface AdapterInterface {
  status: Status;
  chainId: ChainId;
  accounts: Accounts;
  activeAccount: ActiveAccount;
  walletOptions: readonly WalletOption[];
  initialize(): Promise<void>;
  connect(walletId: string): Promise<void>;
  disconnect(): Promise<void>;
  switchAccount(account: Account): void;
  switchChain(chainId: ChainId): Promise<void>;
}
