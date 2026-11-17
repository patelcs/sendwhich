'use client';

import type { Address } from '@/wallet-adapter';
import { getBalance } from '@/web3/ERC20';
import { useAsyncValue } from './useAsyncValue';

export interface BalanceToken {
  address: Address;
  chainId: number;
}

/** Raw balance of `owner` (native or ERC20). Errors are already logged with full context by the read layer. */
export function useTokenBalance(token: BalanceToken | null | undefined, owner: Address | null | undefined) {
  return useAsyncValue(
    token && owner ? () => getBalance({ address: token.address, chainId: token.chainId, owner }) : null,
    [token?.address, token?.chainId, owner],
  );
}
