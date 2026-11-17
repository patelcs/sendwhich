'use client';

import { type LucideIcon } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { ListMenuBar } from './ListMenuBar';
import { ListViewRow, type ListItem, type TextGetter } from './ListViewRow';
import { SelectionBar } from './SelectionBar';
import { EmptyListMessage } from './EmptyListMessage';
import { useListFilter, type SearchTextsGetter } from './useListFilter';

interface Props<LI extends ListItem> {
  list: LI[];
  DefaultIcon: LucideIcon;
  getPrimaryText: TextGetter<LI>;
  getSecondaryText?: TextGetter<LI>;
  getTertiaryText?: TextGetter<LI>;
  secondaryTextVariant?: 'default' | 'address';
  searchPlaceholder?: string;
  addHref?: string;
  defaultsLabel?: string;
  showChainFilter?: boolean;
  onDeleteSelected?: (items: LI[]) => void;
  toolbarExtra?: React.ReactNode;
  /** Picker mode: tapping a row calls this instead of multi-select. */
  onItemClick?: (item: LI) => void;
  /** Per-item fallback icon (overrides `DefaultIcon`). */
  getDefaultIcon?: (item: LI) => LucideIcon;
  /** Texts the search matches; defaults to the primary and secondary text. */
  getSearchTexts?: SearchTextsGetter<LI>;
  initialChainFilter?: number[] | null;
  /** Extra predicate for filters owned by the caller (e.g. category). */
  predicate?: (item: LI) => boolean;
  /** Extra sections inside the filter popover. */
  filterSections?: React.ReactNode;
  filterSectionsActive?: boolean;
  /** Shown when nothing matches and there's no search query. */
  emptyText?: string;
}

export function ListView<LI extends ListItem>({
  list,
  DefaultIcon,
  getPrimaryText,
  getSecondaryText,
  getTertiaryText,
  secondaryTextVariant,
  searchPlaceholder,
  addHref,
  defaultsLabel = 'Default items',
  showChainFilter = true,
  onDeleteSelected,
  toolbarExtra,
  onItemClick,
  getDefaultIcon,
  getSearchTexts,
  initialChainFilter,
  predicate,
  filterSections,
  filterSectionsActive,
  emptyText,
}: Props<LI>): React.ReactNode {
  const {
    query: filterQuery,
    setQuery: setFilterQuery,
    chainFilter,
    setChainFilter,
    showDefaults,
    setShowDefaults,
    matchingList,
  } = useListFilter({
    list,
    getSearchTexts: getSearchTexts ?? ((item) => [getPrimaryText(item), getSecondaryText?.(item)]),
    initialChainFilter,
    predicate,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectedExpanded, setIsSelectedExpanded] = useState(true);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const rowTops = useRef(new Map<string, number>());

  // Resolved from `list` so items removed from it drop out of the selection too.
  const selectedList = selectedIds.flatMap((id) => list.find((i) => i.id === id) ?? []);
  const isSelecting = selectedList.length > 0;

  function isSelected(item: LI) {
    return selectedIds.includes(item.id);
  }

  function setSelection(ids: string[]) {
    setSelectedIds(ids);
    if (ids.length === 0) setIsSelectedExpanded(true);
  }

  function selectItem(item: LI) {
    setSelection([...selectedIds, item.id]);
  }

  function unSelectItem(item: LI) {
    setSelection(selectedIds.filter((id) => id !== item.id));
  }

  const allSelected = matchingList.length > 0 && matchingList.every(isSelected);

  function selectAll() {
    setSelection([...selectedIds, ...matchingList.filter((i) => !isSelected(i)).map((i) => i.id)]);
  }

  function deselectAll() {
    setSelection([]);
  }

  function deleteSelected() {
    onDeleteSelected?.(selectedList);
    setSelection([]);
  }

  const filteredList = matchingList.filter((i) => !isSelected(i));

  // Selected items first (hidden when wrapped), then the filtered rest. Rendered
  // from a single keyed array so React keeps each row mounted when it moves
  // between groups — that's what lets the logo flip and the slide below play.
  const visibleSelectedList = isSelectedExpanded ? selectedList : [];
  const orderedList = [...visibleSelectedList, ...filteredList];

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nextTops = new Map<string, number>();
    rowRefs.current.forEach((el, id) => {
      const top = el.offsetTop;
      nextTops.set(id, top);
      const prevTop = rowTops.current.get(id);
      if (reduceMotion || prevTop === undefined || prevTop === top) return;
      el.animate([{ transform: `translateY(${prevTop - top}px)` }, { transform: 'translateY(0)' }], {
        duration: 300,
        easing: 'ease-in-out',
      });
    });
    rowTops.current = nextTops;
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <ListMenuBar
        query={filterQuery}
        onQueryChange={setFilterQuery}
        searchPlaceholder={searchPlaceholder}
        isSelecting={isSelecting}
        chainFilter={chainFilter}
        onChainFilterChange={setChainFilter}
        showDefaults={showDefaults}
        onShowDefaultsChange={setShowDefaults}
        defaultsLabel={defaultsLabel}
        showChainFilter={showChainFilter}
        addHref={addHref}
        onDeleteSelected={onDeleteSelected && deleteSelected}
        extra={toolbarExtra}
        filterSections={filterSections}
        filterSectionsActive={filterSectionsActive}
      />

      {isSelecting && (
        <SelectionBar
          selectedCount={selectedList.length}
          allSelected={allSelected}
          onToggleAll={allSelected ? deselectAll : selectAll}
          isExpanded={isSelectedExpanded}
          onExpandedChange={setIsSelectedExpanded}
        />
      )}

      <div className="themed-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden bg-transparent">
        {orderedList.map((item, index) => {
          const selected = isSelected(item);
          // Each group (selected / rest) gets its own rounded corners.
          const isFirst = index === 0 || index === visibleSelectedList.length;
          const isLast = index === visibleSelectedList.length - 1 || index === orderedList.length - 1;
          return (
            <ListViewRow
              key={item.id}
              ref={(el) => {
                if (el) rowRefs.current.set(item.id, el);
                else rowRefs.current.delete(item.id);
              }}
              item={item}
              isFirst={isFirst}
              isLast={isLast}
              isSelected={selected}
              onToggle={onItemClick ? undefined : () => (selected ? unSelectItem(item) : selectItem(item))}
              onClick={onItemClick && (() => onItemClick(item))}
              DefaultIcon={getDefaultIcon?.(item) ?? DefaultIcon}
              getPrimaryText={getPrimaryText}
              getSecondaryText={getSecondaryText}
              getTertiaryText={getTertiaryText}
              secondaryTextVariant={secondaryTextVariant}
            />
          );
        })}
        {filteredList.length === 0 && (filterQuery || emptyText) && (
          <EmptyListMessage query={filterQuery} emptyText={emptyText} />
        )}
      </div>
    </div>
  );
}
