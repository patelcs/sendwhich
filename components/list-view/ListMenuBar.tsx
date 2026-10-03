'use client';

import Link from 'next/link';
import { Plus, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { ListFilter } from './ListFilter';

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
  searchPlaceholder?: string;
  isSelecting: boolean;
  chainFilter: number[] | null;
  onChainFilterChange: (chainIds: number[] | null) => void;
  showDefaults?: boolean;
  onShowDefaultsChange: (show: boolean) => void;
  defaultsLabel?: string | undefined;
  showChainFilter?: boolean;
  addHref?: string | undefined;
  onDeleteSelected?: () => void;
  extra?: React.ReactNode;
}

export function ListMenuBar({
  query,
  onQueryChange,
  searchPlaceholder = 'Search',
  isSelecting,
  chainFilter,
  onChainFilterChange,
  showDefaults = true,
  onShowDefaultsChange,
  defaultsLabel,
  showChainFilter,
  addHref,
  onDeleteSelected,
  extra,
}: Props): React.ReactNode {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  function closeSearch() {
    setIsSearchOpen(false);
    onQueryChange('');
  }

  return (
    <div className="flex h-11 shrink-0 items-center gap-3">
      {isSearchOpen ? (
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-(--border) bg-(--input-bg) px-3 py-2">
          <Search size={16} className="shrink-0 text-(--muted)" aria-hidden="true" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-sm text-(--foreground) placeholder:text-(--muted) focus:outline-none"
          />
          <button
            type="button"
            onClick={closeSearch}
            aria-label="Close search"
            className="flex shrink-0 items-center justify-center text-(--muted) transition-colors hover:text-(--foreground)"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setIsSearchOpen(true)} aria-label="Search" className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-(--border) text-(--muted) transition-colors hover:bg-(--accent) hover:text-(--foreground)">
          <Search size={16} aria-hidden="true" />
        </button>
      )}

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
        />
      </div>
    </div>
  );
}
