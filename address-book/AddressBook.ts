import { Dispatch, SetStateAction } from 'react';
import { AddressBookError } from './AddressBookError';
import {
  ContractAddress,
  ContractAddressSchema,
  IdType,
  OmitIdType,
  TokenAddress,
  TokenAddressSchema,
  WalletAddress,
  WalletAddressSchema,
} from './types';
import { LocalStorage } from '@/lib/LocalStorage';
import { getChainLogo, getDefaultContracts, getDefaultTokens } from '@/configs/chain';

export const WALLET_LIST_STORAGE_KEY = 'address-book::wallet-list';
export const CONTRACT_LIST_STORAGE_KEY = 'address-book::contract-list';
export const TOKEN_LIST_STORAGE_KEY = 'address-book::token-list';

export function generateId({ address, chainId = 0, type = 'default' }: { address: string, chainId?: number, type?: IdType['type'] }) {
  return `${type}::${chainId}::${address}`
}

export function loadWalletList(): WalletAddress[] {
  const customList = LocalStorage.loadArray(WALLET_LIST_STORAGE_KEY, WalletAddressSchema);
  return customList.map(i => ({ ...i, id: generateId(i), type: 'custom' }));
}

export function loadContractList(): ContractAddress[] {
  const customList = LocalStorage.loadArray(CONTRACT_LIST_STORAGE_KEY, ContractAddressSchema).map(i => ({ ...i, type: 'custom' } as const));
  const defaultList = getDefaultContracts().map(i => ({ ...i, type: 'default' } as const));
  return [...defaultList, ...customList].map(i => ({ ...i, id: generateId(i), badge: getChainLogo(i.chainId) }));
}

export function loadTokenList(): TokenAddress[] {
  const customList = LocalStorage.loadArray(TOKEN_LIST_STORAGE_KEY, TokenAddressSchema).map(i => ({ ...i, type: 'custom' } as const));
  const defaultList = getDefaultTokens().map(i => ({ ...i, type: 'default' } as const));
  return [...defaultList, ...customList].map(i => ({ ...i, id: generateId(i), badge: getChainLogo(i.chainId) }));
}

export function saveWalletList(list: WalletAddress[]) {
  LocalStorage.save(WALLET_LIST_STORAGE_KEY, list.filter(i => i.type !== 'default'));
}

export function saveContractList(list: ContractAddress[]) {
  LocalStorage.save(CONTRACT_LIST_STORAGE_KEY, list.filter(i => i.type !== 'default'));
}

export function saveTokenList(list: TokenAddress[]) {
  LocalStorage.save(TOKEN_LIST_STORAGE_KEY, list.filter(i => i.type !== 'default'));
}

export function addWalletAddressTo(list: WalletAddress[], setList: Dispatch<SetStateAction<WalletAddress[]>>) {
  return function (value: OmitIdType<WalletAddress>) {
    const existed = list.find((i) => i.address === value.address && i.type === 'custom');
    if (existed) {
      throw new AddressBookError(
        'AlreadyExists',
        'Wallet already exists',
        `Wallet ${value.address} already exists as '${value.name}' in Book`,
      );
    }
    const newList: WalletAddress[] = [...list, { ...value, id: value.address, type: 'custom' }];
    saveWalletList(newList);
    setList(newList);
  }
};

export function addContractAddressTo(list: ContractAddress[], setList: Dispatch<SetStateAction<ContractAddress[]>>) {
  return function (value: OmitIdType<ContractAddress>) {
    const id = `${value.chainId}:${value.address}`;
    const existed = list.find((i) => i.id === id && i.type === 'custom');
    if (existed) {
      throw new AddressBookError(
        'AlreadyExists',
        'Contract already exists',
        `Contract ${value.address} on chain id ${existed.chainId} already exists as '${value.name}' in Book`,
      );
    }
    const newList = ([...list, { ...value, id, type: 'custom' }] as ContractAddress[]).sort((a, b) => b.chainId - a.chainId);
    saveContractList(newList);
    setList(newList);
  }
};

export function addTokenAddressTo(list: TokenAddress[], setList: Dispatch<SetStateAction<TokenAddress[]>>) {
  return function (value: OmitIdType<TokenAddress>) {
    const id = `${value.chainId}:${value.address}`;
    const existed = list.find((i) => i.id === id && i.type === 'custom');
    if (existed) {
      throw new AddressBookError(
        'AlreadyExists',
        'Token already exists',
        `Token ${value.address} on chain id ${existed.chainId} already exists as '${value.name}' in Book`,
      );
    }
    const newList = ([...list, { ...value, id, type: 'custom' }] as TokenAddress[]).sort((a, b) => b.chainId - a.chainId);
    saveTokenList(newList);
    setList(newList);
  }
};

export function removeWalletAddressFrom(list: WalletAddress[], setList: Dispatch<SetStateAction<WalletAddress[]>>) {
  return function (id: string) {
    const newList = list.filter(i => i.id !== id || i.type === 'default');
    if (newList.length === list.length) {
      throw new AddressBookError('NotFound', 'Wallet not found', `Wallet ${id} not found in Book`);
    }
    saveWalletList(newList);
    setList(newList);
  }
};

export function removeContractAddressFrom(list: ContractAddress[], setList: Dispatch<SetStateAction<ContractAddress[]>>) {
  return function (id: string) {
    const newList = list.filter(i => i.id !== id || i.type === 'default').sort((a, b) => b.chainId - a.chainId);;
    if (newList.length === list.length) {
      throw new AddressBookError('NotFound', 'Contract not found', `Contract ${id} not found in Book`);
    }
    saveContractList(newList);
    setList(newList);
  }
};

export function removeTokenAddressFrom(list: TokenAddress[], setList: Dispatch<SetStateAction<TokenAddress[]>>) {
  return function (id: string) {
    const newList = list.filter(i => i.id !== id || i.type === 'default').sort((a, b) => b.chainId - a.chainId);;
    if (newList.length === list.length) {
      throw new AddressBookError('NotFound', 'Token not found', `Token ${id} not found in Book`);
    }
    saveTokenList(newList);
    setList(newList);
  }
};

export function updateWalletAddressIn(list: WalletAddress[], setList: Dispatch<SetStateAction<WalletAddress[]>>) {
  return function (id: string, value: Partial<WalletAddress>) {
    let updated = false;
    const newList = list.map(i => {
      if (i.id === id && i.type === 'custom') {
        updated = true;
        return {
          ...i,
          ...value
        }
      }
      return i;
    });
    if (!updated) {
      throw new AddressBookError('NotFound', 'Wallet not found', `Wallet ${id} not found in Book`);
    }
    saveWalletList(newList);
    setList(newList);
  }
};

export function updateContractAddressIn(list: ContractAddress[], setList: Dispatch<SetStateAction<ContractAddress[]>>) {
  return function (id: string, value: Partial<ContractAddress>) {
    let updated = false;
    const newList = list.map(i => {
      if (i.id === id && i.type === 'custom') {
        updated = true;
        return {
          ...i,
          ...value
        }
      }
      return i;
    }).sort((a, b) => b.chainId - a.chainId);;
    if (!updated) {
      throw new AddressBookError('NotFound', 'Contract not found', `Contract ${id} not found in Book`);
    }
    saveContractList(newList);
    setList(newList);
  }
};

export function updateTokenAddressIn(list: TokenAddress[], setList: Dispatch<SetStateAction<TokenAddress[]>>) {
  return function (id: string, value: Partial<TokenAddress>) {
    let updated = false;
    const newList = list.map(i => {
      if (i.id === id && i.type === 'custom') {
        updated = true;
        return {
          ...i,
          ...value
        }
      }
      return i;
    }).sort((a, b) => b.chainId - a.chainId);;
    if (!updated) {
      throw new AddressBookError('NotFound', 'Token not found', `Token ${id} not found in Book`);
    }
    saveTokenList(newList);
    setList(newList);
  }
};