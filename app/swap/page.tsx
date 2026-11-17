import { PageTitle } from '@/components/layout/PageTitle';

export const metadata = { title: 'Swap' };

export default function SwapPage() {
  return (
    <>
      <PageTitle title="Swap" />
      <div className="rounded-xl border border-dashed border-(--border) p-8 text-center text-sm text-(--muted)">
        Swap coming soon.
      </div>
    </>
  );
}
