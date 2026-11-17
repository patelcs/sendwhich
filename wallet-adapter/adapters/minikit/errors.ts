import { TransactionError, type TransactionErrorCode } from '../../core';

/** MiniKit `SendTransactionErrorCodes` → our codes. Unlisted codes map to `Unknown`. */
const CODE_MAP: Record<string, [TransactionErrorCode, string]> = {
  user_rejected: ['UserRejected', 'Transaction rejected in World App'],
  invalid_contract: ['NotWhitelisted', 'This token or contract is not enabled for this mini app'],
  simulation_failed: ['SimulationFailed', 'Transaction would fail'],
  validation_error: ['InvalidRequest', 'Transaction is invalid'],
  input_error: ['InvalidRequest', 'Transaction is invalid'],
  invalid_operation: ['InvalidRequest', 'Operation not allowed in World App'],
  disallowed_operation: ['InvalidRequest', 'Operation not allowed in World App'],
  malicious_operation: ['InvalidRequest', 'Transaction was flagged as unsafe'],
  daily_tx_limit_reached: ['LimitReached', 'Daily transaction limit reached'],
  transaction_failed: ['Reverted', 'Transaction failed'],
};

// World documents `invalid_contract` for non-whitelisted tokens/contracts, but a Permit2 / allowlist
// problem can also surface as a simulation failure — match its details so it gets the same handling.
const WHITELIST_HINT = /whitelist|allowlist|not allowed|permit2|unknown token|invalid_contract/i;

/** Maps a MiniKit `SendTransactionError` (`{ code, details }`) into a `TransactionError`. */
export function toTransactionError(error: unknown): TransactionError {
  if (error instanceof TransactionError) return error;

  const code = typeof (error as { code?: unknown })?.code === 'string' ? (error as { code: string }).code : undefined;
  const details = (error as { details?: unknown })?.details;
  const detailText = details ? JSON.stringify(details) : error instanceof Error ? error.message : String(error);

  let [mapped, message] = (code && CODE_MAP[code]) || (['Unknown', 'Transaction failed'] as const);
  if (mapped === 'SimulationFailed' && WHITELIST_HINT.test(detailText)) {
    [mapped, message] = CODE_MAP.invalid_contract;
  }
  return new TransactionError(mapped, message, `${code ?? 'unknown'}: ${detailText}`, { cause: error });
}
