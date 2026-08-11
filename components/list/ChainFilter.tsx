'use client';

import { ListFilter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

interface Chain {
  id: number;
  name: string;
}

interface ChainFilterProps {
  chains: readonly Chain[];
  activeChainId: number;
  selected: number[];
  onChange: (chainIds: number[]) => void;
  defaultsLabel: string;
  showDefaults: boolean;
  onShowDefaultsChange: (value: boolean) => void;
}

export function ChainFilter({
  chains,
  activeChainId,
  selected,
  onChange,
  defaultsLabel,
  showDefaults,
  onShowDefaultsChange,
}: ChainFilterProps) {
  const allChainIds = chains.map((chain) => chain.id);
  const isAllSelected = allChainIds.length > 0 && allChainIds.every((id) => selected.includes(id));
  const isActiveSelected = isAllSelected || (selected.length === 1 && selected[0] === activeChainId);
  const isFiltered = selected.length > 0 && !isAllSelected;
  const isActive = isFiltered || !showDefaults;

  function toggleChain(chainId: number) {
    if (selected.includes(chainId)) {
      if (selected.length === 1) return;
      onChange(selected.filter((id) => id !== chainId));
    } else {
      onChange([...selected, chainId]);
    }
  }

  return (
    <Popover>
      <PopoverTrigger
        type="button"
        aria-label="Filter by chain"
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
          isActive
            ? 'border-(--brand)/40 bg-(--brand)/10 text-(--brand) hover:bg-(--brand)/20'
            : 'border-(--border) text-(--muted) hover:bg-(--accent) hover:text-(--foreground)'
        }`}
      >
        <ListFilter size={16} aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 gap-1 p-1">
        <label className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-(--foreground) hover:bg-(--accent)">
          {defaultsLabel}
          <Switch checked={showDefaults} onCheckedChange={onShowDefaultsChange} />
        </label>
        <div className="my-1 h-px bg-(--border)" />
        <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-(--foreground) hover:bg-(--accent)">
          <Checkbox checked={isAllSelected} onCheckedChange={() => onChange(allChainIds)} />
          All chains
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-(--foreground) hover:bg-(--accent)">
          <Checkbox checked={isActiveSelected} onCheckedChange={() => onChange([activeChainId])} />
          Active chain
        </label>
        <div className="my-1 h-px bg-(--border)" />
        <div className="themed-scrollbar flex max-h-64 flex-col gap-0.5 overflow-y-auto">
          {chains.map((chain) => {
            const checked = selected.includes(chain.id);
            return (
              <label
                key={chain.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-(--foreground) hover:bg-(--accent)"
              >
                <Checkbox checked={checked} onCheckedChange={() => toggleChain(chain.id)} />
                {chain.name}
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
