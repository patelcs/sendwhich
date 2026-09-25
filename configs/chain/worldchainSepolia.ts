import { worldchainSepolia } from 'viem/chains';
import { ContractAddresses, ChainConfig, TokenAddressWithIcon } from './types';

export const WORLDCHAIN_SEPOLIA_CONTRACTS: ContractAddresses = {
  multiSender: {
    name: 'Multi Sender',
    address: '0x9025d62b6fBc72f7027Df204Cc32a702B19Be642',
  },
} as const;

export const WORLDCHAIN_SEPOLIA_RPCS = [
  'https://worldchain-sepolia.g.alchemy.com/public',
  'https://worldchain-sepolia.gateway.tenderly.co',
];

export const WORLDCHAIN_SEPOLIA_TOKENS: TokenAddressWithIcon[] = [
  {
    name: 'Bridged USDC',
    symbol: 'USDC.e',
    decimals: 6,
    address: '0x66145f38cBAC35Ca6F1Dfb4914dF98F1614aeA88',
    icon: 'https://etherscan.io/token/images/usdc_ofc_32.svg',
  },
];

export const WORLDCHAIN_SEPOLIA_CONFIGS: ChainConfig = {
  chain: worldchainSepolia,
  rpcUrls: WORLDCHAIN_SEPOLIA_RPCS,
  contracts: WORLDCHAIN_SEPOLIA_CONTRACTS,
  tokens: WORLDCHAIN_SEPOLIA_TOKENS,
} as const;
