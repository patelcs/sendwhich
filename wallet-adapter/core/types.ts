import { type Chain } from 'viem';

export type Status = 'disconnected' | 'connecting' | 'connected';
export type Account = `0x${string}`;
export type ActiveAccount = Account | null;
export type Accounts = readonly Account[];

export interface WalletOption {
  id: string;
  name: string;
  icon: string;
}

export interface WalletEvents {
  statusUpdated: Status;
  chainIdUpdated: number;
  accountsUpdated: Accounts;
  accountUpdated: ActiveAccount;
  walletAdded: WalletOption;
}

export interface AdapterInterface {
  status: Status;
  supportedChains: readonly Chain[];
  chainId: number;
  accounts: Accounts;
  activeAccount: ActiveAccount;
  walletOptions: readonly WalletOption[];
  initialize(): Promise<void>;
  connect(walletId: string): Promise<void>;
  disconnect(): Promise<void>;
  switchAccount(account: Account): void;
  switchChain(chainId: number): Promise<void>;
}
