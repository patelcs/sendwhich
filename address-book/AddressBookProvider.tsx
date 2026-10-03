'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ContractAddress, OmitIdType, TokenAddress, WalletAddress } from './types';
import { addContractAddressTo, addTokenAddressTo, addWalletAddressTo, loadContractList, loadTokenList, loadWalletList, removeContractAddressFrom, removeTokenAddressFrom, removeWalletAddressFrom, updateContractAddressIn, updateTokenAddressIn, updateWalletAddressIn } from './AddressBook';

interface AddressBookContextValue {
  walletList: WalletAddress[];
  contractList: ContractAddress[];
  tokenList: TokenAddress[];
  addWalletAddress(value: OmitIdType<WalletAddress>): void;
  addContractAddress(value: OmitIdType<ContractAddress>): void;
  addTokenAddress(value: OmitIdType<TokenAddress>): void;
  removeWalletAddress(id: string): void;
  removeContractAddress(id: string): void;
  removeTokenAddress(id: string): void;
  updateWalletAddress(id: string, value: Partial<WalletAddress>): void;
  updateContractAddress(id: string, value: Partial<ContractAddress>): void;
  updateTokenAddress(id: string, value: Partial<TokenAddress>): void;
}

const AddressBookContext = createContext<AddressBookContextValue | null>(null);

export const useAddressBook = () => {
  const addressBook = useContext(AddressBookContext);
  if (!addressBook) {
    throw new Error('useAddressBook must be used within AddressBookProvider');
  }
  return addressBook;
};

export default function AddressBookProvider({ children }: { children: React.ReactNode }) {
  const [walletList, setWalletList] = useState<WalletAddress[]>([]);
  const [contractList, setContractList] = useState<ContractAddress[]>([]);
  const [tokenList, setTokenList] = useState<TokenAddress[]>([]);

  useEffect(() => {
    setWalletList(loadWalletList());
    setContractList(loadContractList());
    setTokenList(loadTokenList());
  }, []);

  return (
    <AddressBookContext.Provider
      value={{
        walletList,
        contractList,
        tokenList,
        addWalletAddress: addWalletAddressTo(walletList, setWalletList),
        addContractAddress: addContractAddressTo(contractList, setContractList),
        addTokenAddress: addTokenAddressTo(tokenList, setTokenList),
        removeWalletAddress: removeWalletAddressFrom(walletList, setWalletList),
        removeContractAddress: removeContractAddressFrom(contractList, setContractList),
        removeTokenAddress: removeTokenAddressFrom(tokenList, setTokenList),
        updateWalletAddress: updateWalletAddressIn(walletList, setWalletList),
        updateContractAddress: updateContractAddressIn(contractList, setContractList),
        updateTokenAddress: updateTokenAddressIn(tokenList, setTokenList),
      }}
    >
      {children}
    </AddressBookContext.Provider>
  );
}
