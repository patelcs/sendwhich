'use client';

import { Coins } from 'lucide-react';
import { useAddressBook } from '@/address-book/AddressBookProvider';
import { ListView } from '@/components/list-view';

export default function TokensView() {
  const { tokenList, removeTokenAddress } = useAddressBook();

  return (
    <ListView
      list={tokenList}
      DefaultIcon={Coins}
      getPrimaryText={(entry) => `${entry.name} · ${entry.symbol}`}
      getSecondaryText={(entry) => entry.address}
      secondaryTextVariant="address"
      searchPlaceholder="Search by name, symbol, or address"
      addHref="/address-book/tokens/add"
      defaultsLabel="Verified Tokens"
      onDeleteSelected={(entries) =>
        entries.filter((entry) => entry.type === 'custom').forEach((entry) => removeTokenAddress(entry.id))
      }
    />
  );
}
