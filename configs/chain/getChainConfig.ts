import { MAINNET_CONFIGS } from './mainnet';
import { SEPOLIA_CONFIGS } from './sepolia';
import { ChainConfig } from './types';
import { WORLDCHAIN_CONFIGS } from './worldchain';
import { WORLDCHAIN_SEPOLIA_CONFIGS } from './worldchainSepolia';

export const BROWSER_CHAIN_CONFIGS = [MAINNET_CONFIGS, WORLDCHAIN_CONFIGS, SEPOLIA_CONFIGS, WORLDCHAIN_SEPOLIA_CONFIGS] as const;

export function getChainConfig(chainId: number): ChainConfig | undefined {
  switch (chainId) {
    case MAINNET_CONFIGS.chain.id: return MAINNET_CONFIGS;
    case SEPOLIA_CONFIGS.chain.id: return SEPOLIA_CONFIGS;
    case WORLDCHAIN_CONFIGS.chain.id: return WORLDCHAIN_CONFIGS;
    case WORLDCHAIN_SEPOLIA_CONFIGS.chain.id: return WORLDCHAIN_SEPOLIA_CONFIGS;
    default: return undefined;
  }
}
