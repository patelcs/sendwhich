import type { Address, Hex } from 'viem';
import { CustomError } from '@/lib/CustomError';

/** One contract call / transfer inside a transaction request. */
export interface TransactionCall {
  to: Address;
  /** Encoded calldata; omit for a plain native transfer. */
  data?: Hex;
  /** Native value in wei. */
  value?: bigint;
}

export interface TransactionRequest {
  chainId: number;
  /** Executed in order. MiniKit batches them into one user operation; injected wallets send them one by one. */
  calls: readonly TransactionCall[];
}

export interface SentTransaction {
  /** Identifier available right after submission: a tx hash (injected) or a user-operation hash (MiniKit). */
  id: Hex;
  /** Resolves with the mined transaction hash once confirmed. Throws `TransactionError` if it fails or reverts. */
  wait(): Promise<Hex>;
}

export type TransactionErrorCode =
  | 'NotConnected'
  | 'InvalidRequest'
  | 'UserRejected'
  | 'ChainMismatch'
  /** MiniKit: the token/contract isn't whitelisted for this mini app in the Developer Portal. */
  | 'NotWhitelisted'
  | 'SimulationFailed'
  | 'LimitReached'
  | 'Reverted'
  | 'Timeout'
  | 'Unknown';

export class TransactionError extends CustomError<TransactionErrorCode> {
  override readonly name = 'TransactionError';
}
