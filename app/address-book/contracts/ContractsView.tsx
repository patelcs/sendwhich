'use client';

import { Landmark } from 'lucide-react';
import { useAddressBook } from '@/address-book/AddressBookProvider';
import { ListView } from '@/components/list-view';

export default function ContractsView() {
  const { contractList, removeContractAddress } = useAddressBook();

  return (
    <ListView
      list={contractList}
      DefaultIcon={Landmark}
      getPrimaryText={(entry) => entry.name}
      getSecondaryText={(entry) => entry.address}
      secondaryTextVariant="address"
      searchPlaceholder="Search by name or address"
      addHref="/address-book/contracts/add"
      defaultsLabel="Verified Contracts"
      onDeleteSelected={(entries) =>
        entries.filter((entry) => entry.type === 'custom').forEach((entry) => removeContractAddress(entry.id))
      }
    />
  );
}
