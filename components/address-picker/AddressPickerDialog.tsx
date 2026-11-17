'use client';

import { useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTopBar } from '@/components/ui/dialog';
import { ListView } from '@/components/list-view';
import { MultiSelectFilterGroup } from '@/components/list-view/MultiSelectFilterGroup';
import { formatAddress } from '@/lib/format';
import { ADDRESS_CATEGORIES, CATEGORY_META, type AddressCategory, type AddressPickerItem } from './types';
import { useAddressPickerItems } from './useAddressPickerItems';

export interface AddressPickerProps {
  /** Categories shown by default (pre-checked in the list filter). */
  categories: readonly AddressCategory[];
  /** Only `categories` can be browsed/selected; the list filter can't widen beyond them. */
  strictSelection?: boolean;
  /** Pre-selected chain filter; `null`/omitted shows all chains. */
  chainId?: number | null | undefined;
  title?: string;
  onSelect: (item: AddressPickerItem) => void;
}

interface Props extends AddressPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddressPickerDialog({ open, onOpenChange, title = 'Select address', ...pickerProps }: Props) {
  // Focus the panel itself on open: focusing a control could pop the mobile keyboard. Search opens on tap.
  const popupRef = useRef<HTMLDivElement>(null);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={popupRef}
        initialFocus={popupRef}
        showCloseButton={false}
        className="flex h-[min(36rem,85dvh)] flex-col gap-0 overflow-hidden p-0"
      >
        <DialogTopBar>{title}</DialogTopBar>
        <div className="bg-dotted flex min-h-0 flex-1 flex-col p-3">
          {/* Mounted only while open, so filters reset each time the picker opens. */}
          {open && (
            <AddressPicker
              {...pickerProps}
              onSelect={(item) => {
                pickerProps.onSelect(item);
                onOpenChange(false);
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddressPicker({ categories, strictSelection = false, chainId, onSelect }: AddressPickerProps) {
  const allowed = strictSelection ? categories : ADDRESS_CATEGORIES;
  // `null` = every allowed category.
  const defaultCategories = categories.length >= allowed.length ? null : [...categories];
  const [categoryFilter, setCategoryFilter] = useState<AddressCategory[] | null>(defaultCategories);
  const items = useAddressPickerItems(allowed);
  const categoryOptions = useMemo(
    () => allowed.map((value) => ({ value, label: CATEGORY_META[value].label })),
    [allowed],
  );

  return (
    <ListView
      list={items}
      DefaultIcon={CATEGORY_META[allowed[0] ?? 'wallets'].Icon}
      getDefaultIcon={(item) => CATEGORY_META[item.category].Icon}
      getPrimaryText={(item) => item.name}
      getSecondaryText={(item) => formatAddress(item.address)}
      getSearchTexts={(item) => [item.name, item.address]}
      searchPlaceholder="Search by name or address"
      defaultsLabel="Default addresses"
      initialChainFilter={chainId ? [chainId] : null}
      predicate={(item) => categoryFilter === null || categoryFilter.includes(item.category)}
      onItemClick={onSelect}
      emptyText="No saved addresses match these filters"
      filterSections={
        categoryOptions.length > 1 && (
          <MultiSelectFilterGroup
            selected={categoryFilter}
            onChange={setCategoryFilter}
            options={categoryOptions}
            allLabel="All lists"
          />
        )
      }
      filterSectionsActive={!sameCategories(categoryFilter, defaultCategories)}
    />
  );
}

function sameCategories(a: readonly AddressCategory[] | null, b: readonly AddressCategory[] | null): boolean {
  if (a === null || b === null) return a === b;
  return a.length === b.length && a.every((c) => b.includes(c));
}
