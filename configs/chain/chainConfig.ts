import { Chain } from 'viem';
import { env } from '../env';
import { MAINNET_CONFIGS } from './mainnet';
import { SEPOLIA_CONFIGS } from './sepolia';
import { ChainConfig, ChainContract, ContractAddresses } from './types';
import { WORLDCHAIN_CONFIGS } from './worldchain';
import { WORLDCHAIN_SEPOLIA_CONFIGS } from './worldchainSepolia';

export const BROWSER_CHAIN_CONFIGS = [MAINNET_CONFIGS, WORLDCHAIN_CONFIGS, SEPOLIA_CONFIGS, WORLDCHAIN_SEPOLIA_CONFIGS];

export function getAllChainConfigs(): ChainConfig[] {
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

export function getChainLogo(chainId: number): string | undefined {
  return getChainConfig(chainId).logo;
}

export function getAllChains(): readonly Chain[] {
  return getAllChainConfigs().map(i => i.chain);
}

export function getDefaultTokens() {
  return getAllChainConfigs().flatMap(({ chain, tokens }) => tokens.map(t => ({ ...t, chainId: chain.id })));
}

export function getDefaultContracts() {
  return getAllChainConfigs().flatMap(({ chain, contracts }) =>
    Object.values(contracts)
      .filter((c): c is ChainContract => Boolean(c))
      .map(({ name, address, icon }) => ({ name, address, logo: icon, chainId: chain.id })),
  );
}


