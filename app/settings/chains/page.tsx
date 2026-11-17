import { PageTitle } from '@/components/layout/PageTitle';

export const metadata = { title: 'Chains' };

export default function ChainSettingsPage() {
  return (
    <>
      <PageTitle title="Chains" />
      <div className="rounded-xl border border-dashed border-(--border) p-8 text-center text-sm text-(--muted)">
        Chain settings coming soon.
      </div>
    </>
  );
}
