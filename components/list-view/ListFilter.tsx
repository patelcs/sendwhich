'use client';

import { ListFilter as ListFilterIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { getAllChains } from '@/configs/chain';

interface Props {
  /** Selected chain ids; `null` means every supported chain. */
  selected: number[] | null;
  onChange: (chainIds: number[] | null) => void;
  showDefaults?: boolean;
  onShowDefaultsChange: (show: boolean) => void;
  defaultsLabel?: string;
  showChainFilter?: boolean;
}

export function ListFilter({
  selected,
  onChange,
  showDefaults = true,
  onShowDefaultsChange,
  defaultsLabel = 'Defaults',
  showChainFilter = true,
}: Props): React.ReactNode {
  const allChains = getAllChains();
  const allChainIds = allChains.map((chain) => chain.id);
  // Filtering by chain is meaningless with a single chain.
  const hasChainFilter = showChainFilter && allChains.length > 1;
  const isAll = selected === null;
  const isActive = !isAll || !showDefaults;

  function isChecked(chainId: number) {
    return isAll || selected.includes(chainId);
  }

  function toggleChain(chainId: number) {
    const current = selected ?? allChainIds;
    if (current.includes(chainId)) {
      // Keep at least one chain selected.
      if (current.length > 1) onChange(current.filter((id) => id !== chainId));
      return;
    }
    const next = [...current, chainId];
    onChange(allChainIds.every((id) => next.includes(id)) ? null : next);
  }

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
        <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-(--foreground) hover:bg-(--accent) justify-between">
          {defaultsLabel}
          <Switch checked={showDefaults} onCheckedChange={onShowDefaultsChange} />
        </label>
        {hasChainFilter && (
          <>
            <div className="my-1 h-px bg-(--border)" />
            <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-(--foreground) hover:bg-(--accent)">
              <Checkbox checked={isAll} onCheckedChange={() => onChange(null)} />
              All chains
            </label>
            <div className="my-1 h-px bg-(--border)" />
            <div className="themed-scrollbar flex max-h-64 flex-col gap-0.5 overflow-y-auto">
              {allChains.map((chain) => (
                <label key={chain.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-(--foreground) hover:bg-(--accent)">
                  <Checkbox checked={isChecked(chain.id)} onCheckedChange={() => toggleChain(chain.id)} />
                  {chain.name}
                </label>
              ))}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
