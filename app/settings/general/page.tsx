import { PageTitle } from '@/components/layout/PageTitle';

export const metadata = { title: 'General' };

export default function GeneralSettingsPage() {
  return (
    <>
      <PageTitle title="General" />
      <div className="rounded-xl border border-dashed border-(--border) p-8 text-center text-sm text-(--muted)">
        General settings coming soon.
      </div>
    </>
  );
}
