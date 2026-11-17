import { TransactionError } from '@/wallet-adapter';
import { getExplorerTxUrl } from '@/configs/chain';
import type { ToastOptions } from '@/components/ui/toast';

/** User-facing toast for any error thrown by `sendTransaction` / `wait()`. Details stay in the console. */
export function transactionErrorToast(error: unknown): ToastOptions {
  if (!(error instanceof TransactionError)) {
    return { variant: 'error', title: 'Transaction failed', description: error instanceof Error ? error.message : undefined };
  }
  switch (error.code) {
    case 'UserRejected':
      return { variant: 'info', title: 'Transaction cancelled' };
    case 'NotWhitelisted':
      return {
        variant: 'error',
        title: "This token can't be sent from the mini app yet",
        description: 'It is not enabled for this app. Please try again later.',
      };
    case 'Timeout':
      return { variant: 'error', title: error.message, description: 'It may still go through — check your wallet activity.' };
    default:
      return { variant: 'error', title: error.message, description: error.hint };
  }
}

export function transactionSuccessToast(chainId: number, hash: string, title = 'Transaction confirmed'): ToastOptions {
  const href = getExplorerTxUrl(chainId, hash);
  return { variant: 'success', title, action: href ? { label: 'View on explorer', href } : undefined };
}
