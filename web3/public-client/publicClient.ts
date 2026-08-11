import { getChainConfig } from '@/configs/chain';
import { createPublicClient, http, PublicClient } from 'viem';

export async function getPublicClient(chainId: number, rpcUrl?: string): Promise<PublicClient> {
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
