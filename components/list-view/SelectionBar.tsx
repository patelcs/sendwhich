'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

interface Props {
  selectedCount: number;
  allSelected: boolean;
  onToggleAll: () => void;
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

export function SelectionBar({
  selectedCount,
  allSelected,
  onToggleAll,
  isExpanded,
  onExpandedChange,
}: Props): React.ReactNode {
  return (
    <div className="flex shrink-0 items-center gap-3 px-2 py-2 select-none">
      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
        <Checkbox
          checked={allSelected}
          indeterminate={!allSelected}
          onCheckedChange={onToggleAll}
          aria-label={allSelected ? 'Deselect all' : 'Select all'}
        />
        <span className="truncate text-sm font-medium text-(--foreground)">{selectedCount} selected</span>
      </label>
      <Switch checked={isExpanded} onCheckedChange={onExpandedChange} aria-label="Show selected items" />
    </div>
  );
}
