'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, MoreVertical, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const COPIED_FEEDBACK_MS = 1500;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function highlightMatch(text: string, query: string): React.ReactNode {
  const q = query.trim();
  if (!q) return text;

  const parts = text.split(new RegExp(`(${escapeRegExp(q)})`, 'gi'));
  if (parts.length === 1) return text;

  return parts.map((part, index) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark key={index} className="rounded-sm bg-(--brand)/25 text-(--foreground)">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

interface SelectableListProps<T> {
  items: T[];
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  icon: LucideIcon;
  searchPlaceholder: string;
  searchPredicate: (item: T, query: string) => boolean;
  getPrimary: (item: T, query: string) => React.ReactNode;
  getMeta?: (item: T, query: string) => React.ReactNode;
  getSecondary: (item: T, query: string) => React.ReactNode;
  renderIcon?: (item: T) => React.ReactNode;
  renderBadge?: (item: T) => React.ReactNode;
  isReadOnly?: (item: T) => boolean;
  onAdd: () => void;
  onActivate: (item: T) => void;
  onDeleteSelected: (ids: string[]) => void;
  emptyLabel?: string;
  toolbarExtra?: React.ReactNode;
}

export default function SelectableList<T>({
  items,
  getId,
  getLabel,
  icon: Icon,
  searchPlaceholder,
  searchPredicate,
  getPrimary,
  getMeta,
  getSecondary,
  renderIcon,
  renderBadge,
  isReadOnly,
  onAdd,
  onActivate,
  onDeleteSelected,
  emptyLabel = 'Nothing found.',
  toolbarExtra,
}: SelectableListProps<T>) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isSelectedWrapped, setIsSelectedWrapped] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const copiedTimer = useRef<number | null>(null);

  const isSelecting = selected.size > 0;

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => searchPredicate(item, q));
  }, [items, query, searchPredicate]);

  const selectedItemsList = useMemo(() => items.filter((item) => selected.has(getId(item))), [items, selected, getId]);

  const restItems = useMemo(
    () => (isSelecting ? filteredItems.filter((item) => !selected.has(getId(item))) : filteredItems),
    [filteredItems, isSelecting, selected, getId],
  );

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isMenuOpen]);

  const closeSearch = () => {
    setIsSearchOpen(false);
    setQuery('');
  };

  function toggleSelected(id: string) {
    setExpandedId(null);
    const willBeEmpty = selected.size === 1 && selected.has(id);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (willBeEmpty) setIsSelectedWrapped(false);
  }

  function selectAllFiltered() {
    setExpandedId(null);
    setSelected((prev) => {
      const next = new Set(prev);
      filteredItems.forEach((item) => next.add(getId(item)));
      return next;
    });
    setIsMenuOpen(false);
  }

  function deselectAll() {
    setSelected(new Set());
    setIsSelectedWrapped(false);
    setIsMenuOpen(false);
  }

  function handleDeleteSelected() {
    onDeleteSelected(Array.from(selected));
    setSelected(new Set());
    setIsSelectedWrapped(false);
  }

  function handleDeleteSingle(id: string) {
    onDeleteSelected([id]);
    setExpandedId(null);
  }

  function handleCopy(id: string) {
    navigator.clipboard
      .writeText(id)
      .then(() => {
        if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
        setCopiedId(id);
        copiedTimer.current = window.setTimeout(() => setCopiedId(null), COPIED_FEEDBACK_MS);
      })
      .catch(() => {});
  }

  function handleRowActivate(item: T) {
    const id = getId(item);
    if (isSelecting) {
      toggleSelected(id);
      return;
    }
    setExpandedId((current) => (current === id ? null : id));
  }

  function handleIconClick(event: React.MouseEvent, item: T) {
    event.stopPropagation();
    toggleSelected(getId(item));
  }

  const allFilteredSelected = filteredItems.length > 0 && filteredItems.every((item) => selected.has(getId(item)));
  const showSelectedGroup = isSelecting && selectedItemsList.length > 0;
  const visibleItems = showSelectedGroup && !isSelectedWrapped ? [...selectedItemsList, ...restItems] : restItems;

  function renderActionButtons(item: T, id: string) {
    const readOnly = isReadOnly?.(item) ?? false;
    return (
      <>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleCopy(id);
          }}
          aria-label="Copy"
          className="flex size-8 items-center justify-center rounded-lg text-(--muted) transition-colors hover:bg-(--accent) hover:text-(--foreground)"
        >
          {copiedId === id ? (
            <Check size={15} className="text-(--brand)" aria-hidden="true" />
          ) : (
            <Copy size={15} aria-hidden="true" />
          )}
        </button>
        {!readOnly && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleDeleteSingle(id);
            }}
            aria-label="Delete"
            className="flex size-8 items-center justify-center rounded-lg text-(--muted) transition-colors hover:bg-(--danger)/10 hover:text-(--danger)"
          >
            <Trash2 size={15} aria-hidden="true" />
          </button>
        )}
        {!readOnly && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onActivate(item);
            }}
            aria-label="Edit"
            className="flex size-8 items-center justify-center rounded-lg text-(--muted) transition-colors hover:bg-(--accent) hover:text-(--foreground)"
          >
            <Pencil size={15} aria-hidden="true" />
          </button>
        )}
      </>
    );
  }

  function renderItemRow(item: T, isFirst: boolean, isLast: boolean) {
    const id = getId(item);
    const isSelected = selected.has(id);
    const isExpanded = expandedId === id;
    const label = getLabel(item);
    const iconNode = renderIcon?.(item);

    return (
      <div
        className={`rounded-xs px-2 pt-3.5 transition-colors select-none ${
          isSelected ? 'bg-(--brand)/10' : 'bg-(--card)/60 hover:bg-(--accent)/40'
        } ${isFirst ? 'rounded-t-xl' : ''} ${isLast ? 'rounded-b-xl' : ''} ${
          isExpanded && !isSelecting ? 'pb-2' : 'pb-3.5'
        }`}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleRowActivate(item)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleRowActivate(item);
            }
          }}
          className="relative flex cursor-pointer items-start gap-3"
        >
          <button
            type="button"
            onClick={(event) => handleIconClick(event, item)}
            aria-label={isSelected ? `Deselect ${label}` : `Select ${label}`}
            className="relative size-10 shrink-0 perspective-[600px]"
          >
            <div
              className={`relative size-full transform-3d transition-transform duration-300 ease-in-out ${isSelected ? 'rotate-y-180' : ''}`}
            >
              <div
                className={`absolute inset-0 flex items-center justify-center rounded-full backface-hidden transition-colors ${!iconNode ? 'bg-(--accent) text-(--muted)' : ''}`}
              >
                {iconNode ?? <Icon size={18} aria-hidden="true" />}
                {renderBadge?.(item)}
              </div>

              <div className="absolute inset-0 flex rotate-y-180 items-center justify-center rounded-full bg-(--brand) backface-hidden">
                <Check size={18} className="text-(--brand-foreground)" aria-hidden="true" />
              </div>
            </div>
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-(--foreground)">{getPrimary(item, query)}</p>
            {getMeta && <p className="truncate text-[11px] text-(--muted)">{getMeta(item, query)}</p>}
            <p className="truncate font-mono text-[11px] md:text-xs tracking-tight text-(--muted)">
              {getSecondary(item, query)}
            </p>
          </div>
        </div>

        {isExpanded && !isSelecting && (
          <div className="mt-2 flex items-center justify-end gap-1">{renderActionButtons(item, id)}</div>
        )}
      </div>
    );
  }

  function renderSelectedCountRow() {
    const isOn = !isSelectedWrapped;

    return (
      <div
        role="switch"
        aria-checked={isOn}
        aria-label="Show selected items"
        tabIndex={0}
        onClick={() => setIsSelectedWrapped((wrapped) => !wrapped)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setIsSelectedWrapped((wrapped) => !wrapped);
          }
        }}
        className="flex cursor-pointer items-center gap-3 rounded-lg py-2 transition-colors select-none hover:bg-(--accent)/40"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-(--foreground)">{selected.size} selected</p>
        </div>
        <span
          aria-hidden="true"
          className={`inline-flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors ${
            isOn ? 'bg-(--brand)' : 'bg-(--border)'
          }`}
        >
          <span
            className={`size-4 rounded-full bg-(--foreground) transition-transform ${isOn ? 'translate-x-4' : 'translate-x-0'}`}
          />
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-11 shrink-0 items-center gap-3">
        {isSearchOpen ? (
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-(--border) bg-(--input-bg) px-3 py-2">
            <Search size={16} className="shrink-0 text-(--muted)" aria-hidden="true" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
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
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-(--border) text-(--muted) transition-colors hover:bg-(--accent) hover:text-(--foreground)"
          >
            <Search size={16} aria-hidden="true" />
          </button>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {isSelecting ? (
            <button
              type="button"
              onClick={handleDeleteSelected}
              aria-label="Delete selected"
              className="flex size-9 items-center justify-center rounded-lg border border-(--danger)/30 bg-(--danger)/10 text-(--danger) transition-colors hover:bg-(--danger)/20"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onAdd}
              aria-label="Add"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-(--border) text-(--muted) transition-colors hover:bg-(--accent) hover:text-(--foreground)"
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          )}

          {!isSelecting && toolbarExtra}

          {(filteredItems.length > 0 || isSelecting) && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((open) => !open)}
                aria-label="More options"
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
                className="flex size-9 items-center justify-center rounded-lg border border-(--border) text-(--muted) transition-colors hover:bg-(--accent) hover:text-(--foreground)"
              >
                <MoreVertical size={16} aria-hidden="true" />
              </button>

              {isMenuOpen && (
                <div
                  role="menu"
                  className="absolute top-full right-0 z-20 mt-2 w-40 rounded-lg border border-(--border) bg-(--card) p-1 shadow-2xl"
                >
                  {!allFilteredSelected && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={selectAllFiltered}
                      className="w-full rounded-md px-3 py-2 text-left text-sm text-(--foreground) transition-colors hover:bg-(--accent)"
                    >
                      Select all
                    </button>
                  )}
                  {isSelecting && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={deselectAll}
                      className="w-full rounded-md px-3 py-2 text-left text-sm text-(--foreground) transition-colors hover:bg-(--accent)"
                    >
                      Deselect all
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showSelectedGroup && <div className="shrink-0">{renderSelectedCountRow()}</div>}

      <div className="themed-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden bg-transparent">
        {!showSelectedGroup && restItems.length === 0 ? (
          <p className="py-8 text-center text-sm text-(--muted)">{emptyLabel}</p>
        ) : (
          visibleItems.map((item, index) => (
            <div key={getId(item)}>{renderItemRow(item, index === 0, index === visibleItems.length - 1)}</div>
          ))
        )}
      </div>
    </>
  );
}
