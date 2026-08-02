import { type Chain } from 'viem';

export type Status = 'disconnected' | 'connecting' | 'connected';
export type Account = `0x${string}`;
export type ActiveAccount = Account | null;
export type Accounts = readonly Account[];

export type AdapterId = 'injected-wallet-adapter' | 'minikit-wallet-adapter';

export interface AdapterOption {
  id: string;
  name: string;
  icon: string;
}

export interface AdapterEvents {
  statusUpdated: Status;
  chainIdUpdated: number;
  accountsUpdated: Accounts;
  accountUpdated: ActiveAccount;
  adapterOptionAdded: AdapterOption;
}

export interface AdapterInterface {
  id: AdapterId;
  name: string;
  status: Status;
  supportedChains: readonly Chain[];
  chainId: number;
  accounts: Accounts;
  activeAccount: ActiveAccount;
  adapterOptions: readonly AdapterOption[];
  initialize(): Promise<void>;
  initialConnect(adapterOptionId: string): Promise<void>;
  connect(adapterOptionId: string): Promise<void>;
  disconnect(): Promise<void>;
  switchAccount(account: Account): void;
  switchChain(chainId: number): Promise<void>;
}
