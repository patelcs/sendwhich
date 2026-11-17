'use client';

import { Checkbox } from '@/components/ui/checkbox';

export interface FilterOption<T extends string | number> {
  value: T;
  label: string;
}

interface Props<T extends string | number> {
  /** Selected values; `null` means all of them. */
  selected: readonly T[] | null;
  onChange: (selected: T[] | null) => void;
  options: readonly FilterOption<T>[];
  allLabel?: string;
}

/**
 * "All" checkbox plus one checkbox per option, for the list filter popover.
 * At least one option always stays selected; selecting every option collapses back to `null` (All).
 * Renders nothing with fewer than two options.
 */
export function MultiSelectFilterGroup<T extends string | number>({
  selected,
  onChange,
  options,
  allLabel = 'All',
}: Props<T>): React.ReactNode {
  if (options.length <= 1) return null;

  const allValues = options.map((option) => option.value);
  const isAll = selected === null;

  function toggle(value: T) {
    const current = selected ?? allValues;
    if (current.includes(value)) {
      if (current.length > 1) onChange(current.filter((v) => v !== value));
      return;
    }
    const next = [...current, value];
    onChange(allValues.every((v) => next.includes(v)) ? null : next);
  }

  return (
    <>
      <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-(--foreground) hover:bg-(--accent)">
        <Checkbox checked={isAll} onCheckedChange={() => onChange(null)} />
        {allLabel}
      </label>
      <div className="my-1 h-px bg-(--border)" />
      <div className="themed-scrollbar flex max-h-64 flex-col gap-0.5 overflow-y-auto">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-(--foreground) hover:bg-(--accent)"
          >
            <Checkbox checked={isAll || selected.includes(option.value)} onCheckedChange={() => toggle(option.value)} />
            {option.label}
          </label>
        ))}
      </div>
    </>
  );
}
