'use client';

import { useMemo } from 'react';
import { useAddressBook } from '@/address-book/AddressBookProvider';
import type { AddressCategory, AddressPickerItem } from './types';

/** Address-book entries of the given categories as one picker list (ids are unique across categories). */
export function useAddressPickerItems(categories: readonly AddressCategory[]): AddressPickerItem[] {
  const { tokenList, walletList, contractList } = useAddressBook();

  return useMemo(() => {
    const items: AddressPickerItem[] = [];
    if (categories.includes('tokens')) {
      tokenList.forEach((entry) =>
        items.push({
          ...base('tokens', entry),
          category: 'tokens',
          name: `${entry.name} · ${entry.symbol}`,
          chainId: entry.chainId,
          entry,
        }),
      );
    }
    if (categories.includes('wallets')) {
      walletList.forEach((entry) => items.push({ ...base('wallets', entry), category: 'wallets', entry }));
    }
    if (categories.includes('contracts')) {
      contractList.forEach((entry) =>
        items.push({ ...base('contracts', entry), category: 'contracts', chainId: entry.chainId, entry }),
      );
    }
    return items;
  }, [categories, tokenList, walletList, contractList]);
}

function base(
  category: AddressCategory,
  entry: { id: string; type: 'default' | 'custom'; name: string; address: string; logo?: string; badge?: string },
) {
  return {
    id: `${category}::${entry.id}`,
    type: entry.type,
    name: entry.name,
    address: entry.address,
    logo: entry.logo,
    badge: entry.badge,
  };
}

/** The address-book entry (of `categories`) whose address equals `address`, preferring `chainId`. */
export function useAddressBookMatch(
  address: string,
  categories: readonly AddressCategory[],
  chainId?: number,
): AddressPickerItem | undefined {
  const items = useAddressPickerItems(categories);
  const target = address.trim().toLowerCase();
  if (!target) return undefined;
  const matches = items.filter((item) => item.address.toLowerCase() === target);
  return matches.find((item) => item.chainId === undefined || item.chainId === chainId) ?? matches[0];
}
