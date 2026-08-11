'use client';

import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { useAddressBook } from '@/address-book/AddressBookProvider';
import type { Address, WalletAddress } from '@/address-book';
import SelectableList, { highlightMatch } from '@/components/list/SelectableList';
import WalletForm from './WalletForm';

type ViewState = { mode: 'list' } | { mode: 'add' } | { mode: 'edit'; entry: WalletAddress };

export default function WalletsView() {
  const { walletList, removeWalletAddress } = useAddressBook();
  const [view, setView] = useState<ViewState>({ mode: 'list' });

  const backToList = () => setView({ mode: 'list' });

  return (
    // Mobile 148px = top navbar (64) + page top padding (16) + bottom navbar (56) + gap above it (12).
    // Desktop 144px = top navbar (64) + page top/bottom padding (40 + 40), no bottom navbar.
    // Either way this column plus the fixed chrome never exceeds the viewport — only the list below scrolls.
    <div className="flex h-[calc(100dvh-148px-env(safe-area-inset-bottom))] flex-col gap-4 md:h-[calc(100dvh-144px-env(safe-area-inset-bottom))]">
      {view.mode !== 'list' ? (
        <WalletForm entry={view.mode === 'edit' ? view.entry : undefined} onDone={backToList} onCancel={backToList} />
      ) : (
        <SelectableList
          items={walletList}
          getId={(entry) => entry.address}
          getLabel={(entry) => entry.name}
          icon={Wallet}
          searchPlaceholder="Search by name or address"
          searchPredicate={(entry, q) =>
            entry.name.toLowerCase().includes(q) || entry.address.toLowerCase().includes(q)
          }
          getPrimary={(entry, query) => highlightMatch(entry.name, query)}
          getSecondary={(entry, query) => highlightMatch(entry.address, query)}
          onAdd={() => setView({ mode: 'add' })}
          onActivate={(entry) => setView({ mode: 'edit', entry })}
          onDeleteSelected={(addresses) => addresses.forEach((address) => removeWalletAddress(address as Address))}
          emptyLabel="No addresses found."
        />
      )}
    </div>
  );
}
