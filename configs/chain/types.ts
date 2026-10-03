import type { Chain, Address } from 'viem';

export interface ContractAddresses {
  multiSender?: {
    name: 'Multi Sender';
    address: Address;
    icon?: string;
  };
}

export type ChainContract = NonNullable<ContractAddresses[keyof ContractAddresses]>;

export type TokenAddress = {
  symbol: string;
  name: string;
  address: `0x${string}`;
  logo?: string | undefined;
  decimals: number;
}

export interface ChainConfig {
  chain: Chain;
  rpcUrls: string[];
  contracts: ContractAddresses;
  tokens: TokenAddress[];
  logo?: string;
}
