import { type Chain, type Address as ViemAddress, isAddress } from 'viem';
import z from 'zod';

export type Status = 'initializing' | 'initialized' | 'connecting' | 'connected' | 'disconnected';

export type Account = ViemAddress;
export type Address = ViemAddress;
export const AccountSchema = z.string().refine(isAddress, { error: 'Invalid Ethereum Address' }).nullable();
export type ActiveAccount = z.infer<typeof AccountSchema>;
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
