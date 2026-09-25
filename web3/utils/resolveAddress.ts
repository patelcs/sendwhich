import { Address } from '@/address-book';
import { getAddress, isAddress } from 'viem';
import { getPublicClient } from '../public-client';

export async function resolveShortAddress(address: Address): Promise<Address> {
  if (!/^0x[0-9a-fA-F]+$/.test(address)) throw new Error(`Invalid address: ${address}`);

  const hex = address.slice(2);
  if (hex.length > 40) throw new Error(`Invalid address: ${address}`);

  return getAddress(`0x${hex.padStart(40, '0')}`);
}

export async function resolveEnsAddress(address: Address): Promise<Address> {
  if (!address.endsWith('.eth')) throw new Error(`Invalid address: ${address}`);

  const publicClient = getPublicClient({ chainId: 1 });
  const resolvedEns = await publicClient.getEnsAddress({
    name: address.trim().toLowerCase(),
  });

  if (!resolvedEns) throw new Error(`Invalid address: ${address}`);

  return resolvedEns;
}

export async function resolveAddress(address: Address): Promise<Address> {
  if (isAddress(address, { strict: false })) return getAddress(address);

  try {
    const shortAddress = await resolveShortAddress(address);
    if (shortAddress) return shortAddress;
  } catch (error) {}

  return await resolveEnsAddress(address);
}
