'use client';

import { isAddress, isAddressEqual } from 'viem';
import type { TokenAddress } from '@/address-book';
import type { Address } from '@/wallet-adapter';
import { getInfo } from '@/web3/ERC20';
import { useAsyncValue } from './useAsyncValue';

export interface ResolvedToken {
  address: Address;
  chainId: number;
  name: string;
  symbol: string;
  decimals: number;
  logo?: string | undefined;
  /** Came from the address book rather than an on-chain lookup. */
  fromAddressBook: boolean;
}

export class InvalidTokenAddressError extends Error {}

/**
 * Turns a token-address input into token details:
 * the picked entry → an address-book match on `chainId` → native currency / on-chain ERC20 details.
 */
export function useResolvedToken(
  input: string,
  chainId: number,
  tokenList: readonly TokenAddress[],
  picked?: TokenAddress | null,
) {
  const address = input.trim();

  return useAsyncValue<ResolvedToken>(
    address
      ? async () => {
          if (!isAddress(address, { strict: false })) throw new InvalidTokenAddressError('Invalid token address');

          const known =
            (picked && isAddressEqual(picked.address, address) ? picked : undefined) ??
            tokenList.find((t) => t.chainId === chainId && isAddressEqual(t.address, address));
          if (known) return { ...known, fromAddressBook: true };

          const info = await getInfo({ address, chainId });
          return { address, chainId, ...info, fromAddressBook: false };
        }
      : null,
    [address, chainId, tokenList, picked],
  );
}
