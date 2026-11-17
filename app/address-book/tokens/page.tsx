import { PageTitle } from '@/components/layout/PageTitle';
import TokensView from './TokensView';

export const metadata = { title: 'Tokens' };

export default function TokensPage() {
  return (
    <>
      <PageTitle title="Tokens" />
      <TokensView />
    </>
  );
}
