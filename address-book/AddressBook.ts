import { EventEmitter } from '@/lib/EventEmitter';
import { AddressBookError } from './AddressBookError';
import {
  Address,
  AddressBookEvents,
  AddressBookInterface,
  ContractAddress,
  ContractAddressSchema,
  TokenAddress,
  TokenAddressSchema,
  WalletAddress,
  WalletAddressSchema,
} from './types';
import { LocalStorage } from '@/lib/LocalStorage';

export class AddressBook extends EventEmitter<AddressBookEvents> implements AddressBookInterface {
  static WALLET_LIST_STORAGE_KEY = 'address-book::wallet-list';
  static CONTRACT_LIST_STORAGE_KEY = 'address-book::contract-list';
  static TOKEN_LIST_STORAGE_KEY = 'address-book::token-list';

  private _walletList: WalletAddress[] = [];
  private _contractList: ContractAddress[] = [];
  private _tokenList: TokenAddress[] = [];
  private _isLoaded = false;

  initialLoad() {
    if (this._isLoaded) return;
    this._walletList = LocalStorage.loadArray(AddressBook.WALLET_LIST_STORAGE_KEY, WalletAddressSchema);
    this.emit('walletListUpdated', [...this._walletList]);
    this._contractList = LocalStorage.loadArray(AddressBook.CONTRACT_LIST_STORAGE_KEY, ContractAddressSchema);
    this.emit('contractListUpdated', [...this._contractList]);
    this._tokenList = LocalStorage.loadArray(AddressBook.TOKEN_LIST_STORAGE_KEY, TokenAddressSchema);
    this.emit('tokenListUpdated', [...this._tokenList]);
    this._isLoaded = true;
  }

  get walletList() {
    this.initialLoad();
    return [...this._walletList];
  }

  get contractList() {
    this.initialLoad();
    return [...this._contractList];
  }

  get tokenList() {
    this.initialLoad();
    return [...this._tokenList];
  }

  addWalletAddress = (value: WalletAddress) => {
    this.initialLoad();
    const existed = this._walletList.find((i) => i.address === value.address);
    if (existed)
      throw new AddressBookError(
        'AlreadyExists',
        'Wallet already exists',
        `Wallet ${value.address} already exists as '${value.name}' in Book`,
      );
    this._walletList.push(value);
    LocalStorage.save(AddressBook.WALLET_LIST_STORAGE_KEY, this._walletList);
    this.emit('walletListUpdated', this.walletList);
  };

  addContractAddress = (value: ContractAddress) => {
    this.initialLoad();
    const existed = this._contractList.find((i) => i.address === value.address && i.chainId === value.chainId);
    if (existed)
      throw new AddressBookError(
        'AlreadyExists',
        'Contract already exists',
        `Contract ${value.address} on chain id ${existed.chainId} already exists as '${value.name}' in Book`,
      );
    this._contractList.push(value);
    LocalStorage.save(AddressBook.CONTRACT_LIST_STORAGE_KEY, this._contractList);
    this.emit('contractListUpdated', this.contractList);
  };

  addTokenAddress = (value: TokenAddress) => {
    this.initialLoad();
    const existed = this._tokenList.find((i) => i.address === value.address && i.chainId === value.chainId);
    if (existed)
      throw new AddressBookError(
        'AlreadyExists',
        'Token already exists',
        `Token ${value.address} on chain id ${existed.chainId} already exists as '${value.name}' in Book`,
      );
    this._tokenList.push(value);
    LocalStorage.save(AddressBook.TOKEN_LIST_STORAGE_KEY, this._tokenList);
    this.emit('tokenListUpdated', this.tokenList);
  };

  removeWalletAddress = (address: Address) => {
    this.initialLoad();
    for (let index = 0; index < this._walletList.length; index++) {
      const item = this._walletList[index];
      if (item.address === address) {
        this._walletList.splice(index, 1);
        LocalStorage.save(AddressBook.WALLET_LIST_STORAGE_KEY, this._walletList);
        this.emit('walletListUpdated', this.walletList);
        return;
      }
    }
    throw new AddressBookError('NotFound', 'Wallet not found', `Wallet ${address} not found in Book`);
  };

  removeContractAddress = (address: Address, chainId: number) => {
    this.initialLoad();
    for (let index = 0; index < this._contractList.length; index++) {
      const item = this._contractList[index];
      if (item.address === address && item.chainId == chainId) {
        this._contractList.splice(index, 1);
        LocalStorage.save(AddressBook.CONTRACT_LIST_STORAGE_KEY, this._contractList);
        this.emit('contractListUpdated', this.contractList);
        return;
      }
    }
    throw new AddressBookError('NotFound', 'Contract not found', `Contract ${address} not found in Book`);
  };

  removeTokenAddress = (address: Address, chainId: number) => {
    this.initialLoad();
    for (let index = 0; index < this._tokenList.length; index++) {
      const item = this._tokenList[index];
      if (item.address === address && item.chainId == chainId) {
        this._tokenList.splice(index, 1);
        LocalStorage.save(AddressBook.TOKEN_LIST_STORAGE_KEY, this._tokenList);
        this.emit('tokenListUpdated', this.tokenList);
        return;
      }
    }
    throw new AddressBookError('NotFound', 'Token not found', `Token ${address} not found in Book`);
  };

  updateWalletAddress = (address: Address, value: Partial<WalletAddress>) => {
    this.initialLoad();
    for (let index = 0; index < this._walletList.length; index++) {
      const item = this._walletList[index];
      if (item.address === address) {
        this._walletList[index] = { ...this._walletList[index], ...value };
        LocalStorage.save(AddressBook.WALLET_LIST_STORAGE_KEY, this._walletList);
        this.emit('walletListUpdated', this.walletList);
        return;
      }
    }
    throw new AddressBookError('NotFound', 'Wallet not found', `Wallet ${address} not found in Book`);
  };

  updateContractAddress = (address: Address, chainId: number, value: Partial<ContractAddress>) => {
    this.initialLoad();
    for (let index = 0; index < this._contractList.length; index++) {
      const item = this._contractList[index];
      if (item.address === address && item.chainId === chainId) {
        this._contractList[index] = { ...this._contractList[index], ...value };
        LocalStorage.save(AddressBook.CONTRACT_LIST_STORAGE_KEY, this._contractList);
        this.emit('contractListUpdated', this.contractList);
        return;
      }
    }
    throw new AddressBookError('NotFound', 'Contract not found', `Contract ${address} not found in Book`);
  };

  updateTokenAddress = (address: Address, chainId: number, value: Partial<TokenAddress>) => {
    this.initialLoad();
    for (let index = 0; index < this._tokenList.length; index++) {
      const item = this._tokenList[index];
      if (item.address === address && item.chainId === chainId) {
        this._tokenList[index] = { ...this._tokenList[index], ...value };
        LocalStorage.save(AddressBook.TOKEN_LIST_STORAGE_KEY, this._tokenList);
        this.emit('tokenListUpdated', this.tokenList);
        return;
      }
    }
    throw new AddressBookError('NotFound', 'Token not found', `Token ${address} not found in Book`);
  };
}
