import { TokenAddress } from '@/address-book';
import type { Chain, Address } from 'viem';

export interface ContractAddresses {
  multiSender?: {
    name: 'Multi Sender';
    address: Address;
    icon?: string;
  };
}

export interface TokenAddressWithIcon extends Omit<TokenAddress, 'chainId'> {
  icon?: string;
}

export interface ChainConfig {
  chain: Chain;
  rpcUrls: string[];
  contracts: ContractAddresses;
  tokens: TokenAddressWithIcon[];
}
