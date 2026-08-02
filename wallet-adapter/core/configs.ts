import { LocalStorage } from '../lib';
import { ActiveAccount } from './types';

export interface Configs {
  adapterOptionId?: string;
  account: ActiveAccount;
  chainId: number;
}

export class WalletConfigs {
  static WALLET_CONFIG_STORAGE_KEY = 'wallet-configs';
  static get() {
    const configs = LocalStorage.load<Configs>(this.WALLET_CONFIG_STORAGE_KEY);
    if (!configs) return { account: null, chainId: 0 };
    return configs;
  }
  static set(configs: Configs) {
    LocalStorage.save(this.WALLET_CONFIG_STORAGE_KEY, configs);
  }
  static reset() {
    LocalStorage.remove(this.WALLET_CONFIG_STORAGE_KEY);
  }
  static get adapterOptionId() {
    return this.get()?.adapterOptionId;
  }
  static get account() {
    return this.get()?.account ?? null;
  }
  static get chainId() {
    return this.get()?.chainId;
  }
  static set adapterOptionId(adapterOptionId: string | undefined) {
    this.set({ ...this.get(), adapterOptionId });
  }
  static set account(account: ActiveAccount) {
    this.set({ ...this.get(), account });
  }
  static set chainId(chainId: number) {
    this.set({ ...this.get(), chainId });
  }
}
