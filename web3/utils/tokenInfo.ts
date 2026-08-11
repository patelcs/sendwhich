import { getContract } from 'viem';
import ERC20Abi from '../abi/ERC20.json';
import { getPublicClient } from '../public-client';
import { Address } from '@/wallet-adapter';

export type RequiredTokenInfo = 'name' | 'symbol' | 'decimals';

export async function getTokenInfo(
  address: Address,
  chainId: number,
  rpcUrl?: string,
  requiredInfo: RequiredTokenInfo[] = ['name', 'symbol', 'decimals'],
) {
  const publicClient = await getPublicClient(chainId, rpcUrl);
  const token = getContract({
    address: address,
    abi: ERC20Abi,
    client: publicClient,
  });
  return await Promise.all(requiredInfo.map((info) => token.read[info]()));
}
