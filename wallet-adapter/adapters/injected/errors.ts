import {
  BaseError,
  ContractFunctionRevertedError,
  ExecutionRevertedError,
  InsufficientFundsError,
  UserRejectedRequestError,
} from 'viem';
import { TransactionError } from '../../core';

/** Maps a viem / EIP-1193 error thrown while sending into a `TransactionError`. */
export function toTransactionError(error: unknown): TransactionError {
  if (error instanceof TransactionError) return error;

  const viemError = error instanceof BaseError ? error : null;
  const is = (type: abstract new (...args: never[]) => Error) => !!viemError?.walk((e) => e instanceof type);
  const detail = viemError?.shortMessage ?? (error instanceof Error ? error.message : String(error));
  const options = { cause: error };

  // Some wallets throw a plain `{ code: 4001 }` object instead of a viem error.
  if (is(UserRejectedRequestError) || (error as { code?: unknown })?.code === 4001) {
    return new TransactionError('UserRejected', 'Transaction rejected in wallet', detail, options);
  }
  if (is(InsufficientFundsError)) {
    return new TransactionError('SimulationFailed', 'Not enough native balance to pay for gas', detail, options);
  }
  if (is(ContractFunctionRevertedError) || is(ExecutionRevertedError)) {
    return new TransactionError('SimulationFailed', 'Transaction would fail', detail, options);
  }
  return new TransactionError('Unknown', 'Transaction failed', detail, options);
}
