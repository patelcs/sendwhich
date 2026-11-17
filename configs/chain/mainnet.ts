import { mainnet } from 'viem/chains';
import { ContractAddresses, ChainConfig, TokenAddress } from './types';
import { nativeToken } from './native';

export const MAINNET_CONTRACTS: ContractAddresses = {} as const;

export const MAINNET_RPCS = ['https://eth-mainnet.g.alchemy.com/public', 'https://mainnet.gateway.tenderly.co'];

export const MAINNET_TOKENS: TokenAddress[] = [
  nativeToken(mainnet),
  {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    logo: 'https://etherscan.io/token/images/usdc_ofc_32.svg',
  },
];

export const MAINNET_CONFIGS: ChainConfig = {
  chain: mainnet,
  rpcUrls: MAINNET_RPCS,
  contracts: MAINNET_CONTRACTS,
  tokens: MAINNET_TOKENS,
  logo: '/logo/ethereum.png',
} as const;

mainnet.rpcUrls;
