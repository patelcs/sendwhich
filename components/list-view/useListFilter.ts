'use client';

import { useState } from 'react';
import type { ListItem } from './ListViewRow';

/** Texts a query is matched against. Async (Promise) texts are skipped. */
export type SearchTextsGetter<LI> = (item: LI) => readonly (string | Promise<string> | undefined)[];

export interface ListFilterOptions<LI extends ListItem> {
  list: readonly LI[];
  getSearchTexts: SearchTextsGetter<LI>;
  initialChainFilter?: number[] | null;
  /** Extra predicate for filters owned by the caller (e.g. category). */
  predicate?: (item: LI) => boolean;
}

/** Search + chain + defaults filtering shared by every list (ListView, AddressPicker, …). */
export function useListFilter<LI extends ListItem>({
  list,
  getSearchTexts,
  initialChainFilter = null,
  predicate,
}: ListFilterOptions<LI>) {
  const [query, setQuery] = useState('');
  const [chainFilter, setChainFilter] = useState<number[] | null>(initialChainFilter);
  const [showDefaults, setShowDefaults] = useState(true);

  const normalizedQuery = query.trim().toLowerCase();

  function isMatch(item: LI) {
    if (!showDefaults && item.type === 'default') return false;
    // Items without a chain (e.g. wallets) are chain-agnostic and always pass the chain filter.
    if (chainFilter && item.chainId !== undefined && !chainFilter.includes(item.chainId)) return false;
    if (predicate && !predicate(item)) return false;
    if (!normalizedQuery) return true;
    return getSearchTexts(item).some((text) => typeof text === 'string' && text.toLowerCase().includes(normalizedQuery));
  }

  return {
    query,
    setQuery,
    chainFilter,
    setChainFilter,
    showDefaults,
    setShowDefaults,
    matchingList: list.filter(isMatch),
  };
}
