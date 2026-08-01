import { Zap } from 'lucide-react';
import { APP_DESCRIPTION, APP_NAME } from '@/lib/constants';
import ConnectWalletButton from './ConnectWalletButton';

export default function WalletConnectScreen() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-(--background) px-4 text-center">
      <div className="flex items-center gap-2 text-2xl font-bold">
        <Zap size={28} className="text-(--brand)" aria-hidden="true" />
        <span className="bg-linear-to-r from-(--brand) to-(--brand-secondary) bg-clip-text text-transparent">
          {APP_NAME}
        </span>
      </div>

      <div className="max-w-sm space-y-2">
        <h1 className="text-xl font-bold text-(--foreground)">Connect your wallet</h1>
        <p className="text-sm text-(--muted)">{APP_DESCRIPTION}</p>
      </div>

      <ConnectWalletButton />
    </div>
  );
}
