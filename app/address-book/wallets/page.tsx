import { PageTitle } from '@/components/layout/PageTitle';
import WalletsView from './WalletsView';

export const metadata = { title: 'Wallet Addresses' };

export default function WalletsPage() {
  return (
    <>
      <PageTitle title="Wallets" />
      <WalletsView />
    </>
  );
}
