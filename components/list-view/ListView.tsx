'use client';

import { type LucideIcon } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { ListMenuBar } from './ListMenuBar';
import { ListViewRow, type ListItem, type TextGetter } from './ListViewRow';
import { SelectionBar } from './SelectionBar';

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
}: Props<LI>): React.ReactNode {
  const [filterQuery, setFilterQuery] = useState('');
  const [chainFilter, setChainFilter] = useState<number[] | null>(null);
  const [showDefaults, setShowDefaults] = useState(true);
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

  function isFilterMatch(item: LI) {
    if (!showDefaults && item.type === 'default') return false;
    if (chainFilter && item.chainId !== undefined && !chainFilter.includes(item.chainId)) return false;
    const query = filterQuery.trim().toLowerCase();
    if (!query) return true;
    const [primary, secondary] = [getPrimaryText(item), getSecondaryText?.(item)];
    if (typeof primary === 'string' && primary.toLowerCase().includes(query)) return true;
    if (typeof secondary === 'string' && secondary.toLowerCase().includes(query)) return true;
    return false;
  }

  const matchingList = list.filter(isFilterMatch);
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
      el.animate(
        [{ transform: `translateY(${prevTop - top}px)` }, { transform: 'translateY(0)' }],
        { duration: 300, easing: 'ease-in-out' },
      );
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
              onToggle={() => (selected ? unSelectItem(item) : selectItem(item))}
              DefaultIcon={DefaultIcon}
              getPrimaryText={getPrimaryText}
              getSecondaryText={getSecondaryText}
              getTertiaryText={getTertiaryText}
              secondaryTextVariant={secondaryTextVariant}
            />
          );
        })}
        {filterQuery && filteredList.length === 0 && (
          <p className="py-8 text-center text-sm text-(--muted)">{`No results found for query: '${filterQuery}'`}</p>
        )}
      </div>
    </div>
  );
}
