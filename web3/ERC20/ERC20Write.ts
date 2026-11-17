import { encodeFunctionData } from 'viem';
import type { Address, TransactionCall } from '@/wallet-adapter';
import { isNativeToken } from '@/configs/chain';
import { ERC20_ABI } from './ERC20_ABI';

export interface ERC20TransferArgs {
  /** Token contract, or NATIVE_TOKEN_ADDRESS for the chain's native currency. */
  address: Address;
  to: Address;
  /** Raw amount in the token's smallest unit. */
  amount: bigint;
}

/** A wallet-adapter call for `token.transfer(to, amount)`, or a plain value transfer for the native currency. */
export function buildTransferCall({ address, to, amount }: ERC20TransferArgs): TransactionCall {
  if (isNativeToken(address)) return { to, value: amount };
  return {
    to: address,
    data: encodeFunctionData({ abi: ERC20_ABI, functionName: 'transfer', args: [to, amount] }),
  };
}
