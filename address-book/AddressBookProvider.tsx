'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { AddressBookInterface, ContractAddress, TokenAddress, WalletAddress } from './types';
import { AddressBook } from './AddressBook';

interface AddressBookContextValue extends AddressBookInterface {}

const AddressBookContext = createContext<AddressBookContextValue | null>(null);

export const useAddressBook = () => {
  const addressBook = useContext(AddressBookContext);
  if (!addressBook) {
    throw new Error('useAddressBook must be used within AddressBookProvider');
  }
  return addressBook;
};

export default function AddressBookProvider({ children }: { children: React.ReactNode }) {
  const [book] = useState(() => new AddressBook());
  const [walletList, setWalletList] = useState<WalletAddress[]>([]);
  const [contractList, setContractList] = useState<ContractAddress[]>([]);
  const [tokenList, setTokenList] = useState<TokenAddress[]>([]);

  useEffect(() => {
    const unSubscribers = [
      book.on('walletListUpdated', setWalletList),
      book.on('contractListUpdated', setContractList),
      book.on('tokenListUpdated', setTokenList),
    ];

    book.initialLoad();

    return () => unSubscribers.forEach((unSubscribe) => unSubscribe());
  }, []);

  return (
    <AddressBookContext.Provider
      value={{
        ...(book as AddressBookInterface),
        walletList,
        contractList,
        tokenList,
      }}
    >
      {children}
    </AddressBookContext.Provider>
  );
}
