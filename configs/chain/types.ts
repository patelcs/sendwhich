import type { Chain, Address } from 'viem';

export interface ChainAddresses {
  multiSender?: Address;
}

export interface ChainConfig {
  chain: Chain;
  addresses: ChainAddresses;
}