import { getChainConfig } from '@/configs/chain';
import { createPublicClient, http, PublicClient } from 'viem';

export interface PublicClientOptions {
  chainId: number;
  rpcUrl?: string | null;
}

const clientCache: Map<number, PublicClient> = new Map();

export function getPublicClient({ chainId, rpcUrl }: PublicClientOptions): PublicClient {
  if (clientCache.has(chainId)) return clientCache.get(chainId)!;

  const { chain, rpcUrls } = getChainConfig(chainId);

  let rpc = '';
  if (rpcUrl) rpc = rpcUrl;
  else rpc = rpcUrls[Math.floor(rpcUrls.length * Math.random())];

  const publicClient = createPublicClient({
    chain: chain,
    transport: http(rpc),
  });
  return publicClient;
}
