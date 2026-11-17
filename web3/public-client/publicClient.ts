import { getChainConfig } from '@/configs/chain';
import { createPublicClient, http, PublicClient } from 'viem';

export interface PublicClientOptions {
  chainId: number;
  rpcUrl?: string | null;
}

const clientCache: Map<number, PublicClient> = new Map();

export function getPublicClient({ chainId, rpcUrl }: PublicClientOptions): PublicClient {
  // Only the default (random-RPC) client is cached; an explicit `rpcUrl` always gets its own client.
  if (!rpcUrl && clientCache.has(chainId)) return clientCache.get(chainId)!;

  const { chain, rpcUrls } = getChainConfig(chainId);

  let rpc = '';
  if (rpcUrl) rpc = rpcUrl;
  else rpc = rpcUrls[Math.floor(rpcUrls.length * Math.random())];

  const publicClient = createPublicClient({
    chain: chain,
    transport: http(rpc),
  }) as PublicClient;
  if (!rpcUrl) clientCache.set(chainId, publicClient);
  return publicClient;
}
