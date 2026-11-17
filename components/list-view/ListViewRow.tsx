'use client';

import { Check, type LucideIcon } from 'lucide-react';
import { useMemo } from 'react';
import { ItemLogo } from './ItemLogo';
import { ItemText } from './ItemText';

export interface ListItem {
  id: string;
  type: 'default' | 'custom';
  badge?: string | undefined;
  logo?: string | undefined;
  chainId?: number | undefined;
}

export type TextGetter<LI> = (item: LI) => string | Promise<string>;

interface Props<LI extends ListItem> {
  ref?: React.Ref<HTMLDivElement>;
  item: LI;
  isFirst: boolean;
  isLast: boolean;
  isSelected?: boolean;
  /** Logo flip-to-select (multi-select lists). */
  onToggle?: () => void;
  /** Makes the whole row a single click target (pickers). */
  onClick?: () => void;
  DefaultIcon: LucideIcon;
  getPrimaryText: TextGetter<LI>;
  getSecondaryText?: TextGetter<LI>;
  getTertiaryText?: TextGetter<LI>;
  /** `address` uses a smaller monospace font so full addresses fit on mobile. */
  secondaryTextVariant?: 'default' | 'address';
}

export function ListViewRow<LI extends ListItem>({
  ref,
  item,
  isFirst,
  isLast,
  isSelected = false,
  onToggle,
  onClick,
  DefaultIcon,
  getPrimaryText,
  getSecondaryText,
  secondaryTextVariant = 'default',
}: Props<LI>): React.ReactNode {
  const primary = useMemo(() => getPrimaryText(item), [item, getPrimaryText]);
  const secondary = useMemo(() => getSecondaryText?.(item), [item, getSecondaryText]);
  const Logo = onToggle ? 'button' : 'div';

  return (
    <div
      ref={ref}
      {...(onClick && {
        role: 'button',
        tabIndex: 0,
        onClick,
        onKeyDown: (event: React.KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
          }
        },
      })}
      className={`relative flex cursor-pointer items-start gap-4 ${onClick ? 'outline-none hover:bg-(--accent) focus-visible:ring-2 focus-visible:ring-(--brand)/40' : ''} rounded-xs px-2 py-3.5 transition-colors select-none ${isSelected ? 'bg-(--brand)/10' : 'bg-(--card)/60'} ${isFirst ? 'rounded-t-xl' : ''} ${isLast ? 'rounded-b-xl' : ''}`}
    >
      <Logo {...(onToggle && { type: 'button' as const, onClick: onToggle })} className="relative size-10 shrink-0 perspective-[600px]">
        <div
          className={`relative size-full transform-3d transition-transform duration-300 ease-in-out ${isSelected ? 'rotate-y-180' : ''}`}
        >
          <ItemLogo logo={item.logo} badge={item.badge} DefaultIcon={DefaultIcon} />

          <div className="absolute inset-0 rotate-y-180 rounded-full backface-hidden">
            <ItemLogo logo={item.logo} DefaultIcon={DefaultIcon} />
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-(--brand)/75">
              <Check size={18} className="text-(--brand-foreground)" />
            </div>
            {item.badge && (
              <img
                src={item.badge}
                alt="Default"
                className="absolute -right-1 -bottom-1 size-5 rounded-full border border-(--card)"
              />
            )}
          </div>
        </div>
      </Logo>

      <div className="min-w-0 flex-1">
        <p className="truncate text-md font-medium text-(--foreground)">
          <ItemText value={primary} />
        </p>
        {secondary !== undefined && (
          <p
            className={`truncate text-(--muted) ${
              secondaryTextVariant === 'address' ? 'font-mono text-[11px] tracking-tight md:text-xs' : 'text-sm'
            }`}
          >
            <ItemText value={secondary} skeletonWidthClassName="w-16" />
          </p>
        )}
      </div>
    </div>
  );
}
