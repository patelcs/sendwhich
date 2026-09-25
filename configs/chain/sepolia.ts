import { sepolia } from 'viem/chains';
import { ContractAddresses, ChainConfig, TokenAddressWithIcon } from './types';

export const SEPOLIA_CONTRACTS: ContractAddresses = {
  multiSender: {
    name: 'Multi Sender',
    address: '0x9025d62b6fBc72f7027Df204Cc32a702B19Be642',
  },
} as const;

export const SEPOLIA_RPCS = ['https://sepolia.gateway.tenderly.co'];

export const SEPOLIA_TOKENS: TokenAddressWithIcon[] = [
  {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6,
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    icon: 'https://etherscan.io/token/images/usdc_ofc_32.svg',
  },
];

export const SEPOLIA_CONFIGS: ChainConfig = {
  chain: sepolia,
  rpcUrls: SEPOLIA_RPCS,
  contracts: SEPOLIA_CONTRACTS,
  tokens: SEPOLIA_TOKENS,
} as const;
