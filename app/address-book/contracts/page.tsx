import { PageTitle } from '@/components/layout/PageTitle';
import ContractsView from './ContractsView';

export const metadata = { title: 'Contract Addresses' };

export default function ContractsPage() {
  return (
    <>
      <PageTitle title="Contracts" />
      <ContractsView />
    </>
  );
}
