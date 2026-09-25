'use client';

import { Check, type LucideIcon } from 'lucide-react';
import { useMemo } from 'react';
import { ItemLogo } from './ItemLogo';
import { ItemText } from './ItemText';

export interface ListItem {
  id: string;
  // type: 'default' | 'custom';
  type: string;
  icon?: string | undefined;
}

export type TextGetter<LI> = (item: LI) => string | Promise<string>;

interface Props<LI extends ListItem> {
  item: LI;
  isFirst: boolean;
  isLast: boolean;
  isSelected: boolean;
  onToggle: () => void;
  DefaultIcon: LucideIcon;
  getPrimaryText: TextGetter<LI>;
  getSecondaryText?: TextGetter<LI>;
  getTertiaryText?: TextGetter<LI>;
}

export function ListViewRow<LI extends ListItem>({
  item,
  isFirst,
  isLast,
  isSelected,
  onToggle,
  DefaultIcon,
  getPrimaryText,
  getSecondaryText,
}: Props<LI>): React.ReactNode {
  const primary = useMemo(() => getPrimaryText(item), [item, getPrimaryText]);
  const secondary = useMemo(() => getSecondaryText?.(item), [item, getSecondaryText]);

  return (
    <div
      className={`relative flex cursor-pointer items-start gap-4 rounded-xs px-2 py-3.5 transition-colors select-none ${isSelected ? 'bg-(--brand)/10' : 'bg-(--card)/60'} ${isFirst ? 'rounded-t-xl' : ''} ${isLast ? 'rounded-b-xl' : ''}`}
    >
      <button onClick={onToggle} className="relative size-10 shrink-0 perspective-[600px]">
        <div
          className={`relative size-full transform-3d transition-transform duration-300 ease-in-out ${isSelected ? 'rotate-y-180' : ''}`}
        >
          <ItemLogo icon={item.icon} showVerifiedBadge={item.type === 'default'} DefaultIcon={DefaultIcon} />

          <div className="absolute inset-0 flex rotate-y-180 items-center justify-center rounded-full bg-(--brand) backface-hidden">
            <Check size={18} className="text-(--brand-foreground)" />
          </div>
        </div>
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-md font-medium text-(--foreground)">
          <ItemText value={primary} />
        </p>
        {secondary !== undefined && (
          <p className="truncate text-sm text-(--muted)">
            <ItemText value={secondary} skeletonWidthClassName="w-16" />
          </p>
        )}
      </div>
    </div>
  );
}
