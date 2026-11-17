import { worldchain } from 'viem/chains';
import { ContractAddresses, ChainConfig, TokenAddress } from './types';
import { nativeToken } from './native';

export const WORLDCHAIN_CONTRACTS: ContractAddresses = {
  multiSender: {
    name: 'Multi Sender',
    address: '0x9025d62b6fBc72f7027Df204Cc32a702B19Be642',
  },
} as const;

export const WORLDCHAIN_RPCS = [
  'https://worldchain-mainnet.g.alchemy.com/public',
];

export const WORLDCHAIN_TOKENS: TokenAddress[] = [
  nativeToken(worldchain),
  {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    address: '0x79A02482A880bCE3F13e09Da970dC34db4CD24d1',
    logo: 'https://etherscan.io/token/images/usdc_ofc_32.svg',
  },
  {
    name: 'DNAToken',
    symbol: 'DNA',
    decimals: 18,
    address: '0xED49fE44fD4249A09843C2Ba4bba7e50BECa7113',
  },
  {
    name: 'Worldcoin',
    symbol: 'WLD',
    decimals: 18,
    address: '0x2cFc85d8E48F8EAB294be644d9E25C3030863003',
    logo: 'https://worldscan.org/token/images/worldcoin_ofc_32.png',
  },
];

export const WORLDCHAIN_CONFIGS: ChainConfig = {
  chain: worldchain,
  rpcUrls: WORLDCHAIN_RPCS,
  contracts: WORLDCHAIN_CONTRACTS,
  tokens: WORLDCHAIN_TOKENS,
  logo: '/logo/worldchain.jpeg',
} as const;
