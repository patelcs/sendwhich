'use client';

import { Wallet } from 'lucide-react';
import { useAddressBook } from '@/address-book/AddressBookProvider';
import { ListView } from '@/components/list-view';

export default function WalletsView() {
  const { walletList, removeWalletAddress } = useAddressBook();

  return (
    <ListView
      list={walletList}
      DefaultIcon={Wallet}
      getPrimaryText={(entry) => entry.name}
      getSecondaryText={(entry) => entry.address}
      secondaryTextVariant="address"
      searchPlaceholder="Search by name or address"
      addHref="/address-book/wallets/add"
      showChainFilter={false}
      onDeleteSelected={(entries) => entries.forEach((entry) => removeWalletAddress(entry.id))}
    />
  );
}
