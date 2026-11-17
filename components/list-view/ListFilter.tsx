'use client';

import { ListFilter as ListFilterIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { uiConfigs } from '@/configs';
import { getAllChains } from '@/configs/chain';
import { MultiSelectFilterGroup } from './MultiSelectFilterGroup';

interface Props {
  /** Selected chain ids; `null` means every supported chain. */
  selected: number[] | null;
  onChange: (chainIds: number[] | null) => void;
  showDefaults?: boolean;
  onShowDefaultsChange: (show: boolean) => void;
  defaultsLabel?: string;
  showChainFilter?: boolean;
  /** Extra filter sections rendered first (e.g. a list/category choice). */
  children?: React.ReactNode;
  /** Whether the extra sections narrow the list (highlights the button). */
  extraActive?: boolean;
}

export function ListFilter({
  selected,
  onChange,
  showDefaults = true,
  onShowDefaultsChange,
  defaultsLabel = 'Defaults',
  showChainFilter = true,
  children,
  extraActive = false,
}: Props): React.ReactNode {
  const allChains = getAllChains();
  const chainOptions = allChains.map((chain) => ({ value: chain.id, label: chain.name }));
  // Filtering by chain is meaningless with a single chain.
  const hasChainFilter = showChainFilter && allChains.length > 1;
  const hasDefaultsToggle = uiConfigs.defaultsFilter;
  const isAll = selected === null;
  const isActive = !isAll || (hasDefaultsToggle && !showDefaults) || extraActive;

  // Nothing to filter by: no filter button at all.
  if (!children && !hasDefaultsToggle && !hasChainFilter) return null;

  return (
    <Popover>
      <PopoverTrigger
        type="button"
        aria-label={hasChainFilter ?'Filter by chain' : 'Filter'}
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${isActive
          ? 'border-(--brand)/40 bg-(--brand)/10 text-(--brand) hover:bg-(--brand)/20'
          : 'border-(--border) text-(--muted) hover:bg-(--accent) hover:text-(--foreground)'
          }`}
      >
        <ListFilterIcon size={16} aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 gap-1 p-1">
        {children && (
          <>
            {children}
            {(hasDefaultsToggle || hasChainFilter) && <div className="my-1 h-px bg-(--border)" />}
          </>
        )}
        {hasDefaultsToggle && (
          <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-base text-(--foreground) hover:bg-(--accent) justify-between">
            {defaultsLabel}
            <Switch checked={showDefaults} onCheckedChange={onShowDefaultsChange} />
          </label>
        )}
        {hasChainFilter && (
          <>
            {hasDefaultsToggle && <div className="my-1 h-px bg-(--border)" />}
            <MultiSelectFilterGroup selected={selected} onChange={onChange} options={chainOptions} allLabel="All chains" />
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
