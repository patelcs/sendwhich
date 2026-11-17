'use client';

import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string | undefined;
  /** Starts as an icon button and expands on click; closing clears the query. */
  collapsible?: boolean;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search',
  collapsible = false,
  autoFocus = collapsible,
}: Props): React.ReactNode {
  const [isOpen, setIsOpen] = useState(!collapsible);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Search"
        className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-(--border) text-(--muted) transition-colors hover:bg-(--accent) hover:text-(--foreground)"
      >
        <Search size={16} aria-hidden="true" />
      </button>
    );
  }

  function clear() {
    onChange('');
    if (collapsible) setIsOpen(false);
  }

  return (
    <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-(--border) bg-(--input-bg) px-3">
      <Search size={16} className="shrink-0 text-(--muted)" aria-hidden="true" />
      <input
        type="text"
        autoFocus={autoFocus}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-(--foreground) placeholder:text-(--muted) focus:outline-none"
      />
      {(collapsible || value) && (
        <button
          type="button"
          onClick={clear}
          aria-label={collapsible ? 'Close search' : 'Clear search'}
          className="flex shrink-0 items-center justify-center text-(--muted) transition-colors hover:text-(--foreground)"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
