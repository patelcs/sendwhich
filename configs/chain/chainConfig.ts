import { env } from '../env';
import { MINIKIT_CONFIGS } from '../ui-configs/minikit';
import { MAINNET_CONFIGS } from './mainnet';
import { SEPOLIA_CONFIGS } from './sepolia';
import { ChainConfig, ContractAddresses, TokenAddressWithIcon } from './types';
import { WORLDCHAIN_CONFIGS } from './worldchain';
import { WORLDCHAIN_SEPOLIA_CONFIGS } from './worldchainSepolia';

export const BROWSER_CHAIN_CONFIGS = [MAINNET_CONFIGS, WORLDCHAIN_CONFIGS, SEPOLIA_CONFIGS, WORLDCHAIN_SEPOLIA_CONFIGS];

export function getAllChains() {
  if (env.isMiniApp) return [WORLDCHAIN_CONFIGS];
  return BROWSER_CHAIN_CONFIGS;
}

export function getChainConfig(chainId: number): ChainConfig {
  switch (chainId) {
    case MAINNET_CONFIGS.chain.id:
      return MAINNET_CONFIGS;
    case SEPOLIA_CONFIGS.chain.id:
      return SEPOLIA_CONFIGS;
    case WORLDCHAIN_CONFIGS.chain.id:
      return WORLDCHAIN_CONFIGS;
    case WORLDCHAIN_SEPOLIA_CONFIGS.chain.id:
      return WORLDCHAIN_SEPOLIA_CONFIGS;
  }
  throw new Error(`ChainConfigs not found for chain id: ${chainId}`);
}

export function getChainContracts(chainId: number): ContractAddresses {
  return getChainConfig(chainId).contracts;
}

export function getChainTokens(chainId: number): TokenAddressWithIcon[] {
  return getChainConfig(chainId).tokens;
}
