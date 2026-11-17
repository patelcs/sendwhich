'use client';

import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import { ListFilter } from './ListFilter';
import { SearchInput } from './SearchInput';

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
  searchPlaceholder?: string;
  isSelecting?: boolean;
  chainFilter: number[] | null;
  onChainFilterChange: (chainIds: number[] | null) => void;
  showDefaults?: boolean;
  onShowDefaultsChange: (show: boolean) => void;
  defaultsLabel?: string | undefined;
  showChainFilter?: boolean;
  addHref?: string | undefined;
  onDeleteSelected?: () => void;
  extra?: React.ReactNode;
  /** Extra sections inside the filter popover. */
  filterSections?: React.ReactNode;
  filterSectionsActive?: boolean;
}

export function ListMenuBar({
  query,
  onQueryChange,
  searchPlaceholder = 'Search',
  isSelecting = false,
  chainFilter,
  onChainFilterChange,
  showDefaults = true,
  onShowDefaultsChange,
  defaultsLabel,
  showChainFilter,
  addHref,
  onDeleteSelected,
  extra,
  filterSections,
  filterSectionsActive,
}: Props): React.ReactNode {
  return (
    <div className="flex h-11 shrink-0 items-center gap-3">
      <SearchInput value={query} onChange={onQueryChange} placeholder={searchPlaceholder} collapsible />

      <div className="ml-auto flex shrink-0 items-center gap-2">
        {isSelecting
          ? onDeleteSelected && (
            <button
              type="button"
              onClick={onDeleteSelected}
              aria-label="Delete selected"
              className="flex size-9 items-center justify-center rounded-lg border border-(--danger)/30 bg-(--danger)/10 text-(--danger) transition-colors hover:bg-(--danger)/20"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          )
          : addHref && (
            <Link href={addHref} aria-label="Add" className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-(--border) text-(--muted) transition-colors hover:bg-(--accent) hover:text-(--foreground)">
              <Plus size={16} aria-hidden="true" />
            </Link>
          )}

        {!isSelecting && extra}

        <ListFilter
          selected={chainFilter}
          onChange={onChainFilterChange}
          showDefaults={showDefaults}
          onShowDefaultsChange={onShowDefaultsChange}
          defaultsLabel={defaultsLabel}
          showChainFilter={showChainFilter}
          extraActive={filterSectionsActive}
        >
          {filterSections}
        </ListFilter>
      </div>
    </div>
  );
}
