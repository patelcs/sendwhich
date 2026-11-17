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

/** The chain with its `default` RPCs replaced by the app's curated list (used by wallet adapters). */
export function withAppRpcUrls({ chain, rpcUrls }: ChainConfig): Chain {
  return { ...chain, rpcUrls: { ...chain.rpcUrls, default: { http: rpcUrls } } };
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



/** Block-explorer link for a transaction, if the chain has an explorer. */
export function getExplorerTxUrl(chainId: number, hash: string): string | undefined {
  const explorer = getChainConfig(chainId).chain.blockExplorers?.default.url;
  return explorer ? `${explorer.replace(/\/$/, '')}/tx/${hash}` : undefined;
}
