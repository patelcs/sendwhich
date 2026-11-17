'use client';

import type { LucideIcon } from 'lucide-react';
import { ItemLogo } from '@/components/list-view/ItemLogo';

export interface AddressSelectionData {
  title: string;
  subtitle?: string | undefined;
  logo?: string | undefined;
  /** Small corner badge on the logo (e.g. chain logo). */
  badge?: string | undefined;
  DefaultIcon: LucideIcon;
}

/** Compact "selected entry" display used inside an `AddressInput` in place of the raw address. */
export function AddressSelection({ title, subtitle, logo, badge, DefaultIcon }: AddressSelectionData) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-1.5">
      <div className="relative size-8 shrink-0">
        <ItemLogo logo={logo} badge={badge} DefaultIcon={DefaultIcon} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-md leading-snug font-medium text-(--foreground)">{title}</p>
        {subtitle && <p className="truncate text-sm leading-snug text-(--muted)">{subtitle}</p>}
      </div>
    </div>
  );
}
