'use client';

import { uiConfigs } from '@/configs';
import SecondaryNavbar from '@/components/layout/SecondaryNavbar';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <SecondaryNavbar subRoutes={uiConfigs.routes.addressBookLinks}>{children}</SecondaryNavbar>;
}
