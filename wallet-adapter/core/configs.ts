import { LocalStorage } from '@/lib/LocalStorage';
import { AccountSchema, ActiveAccount } from './types';
import { z } from 'zod';

export const ConfigSchema = z.object({
  adapterOptionId: z.string().optional(),
  account: AccountSchema,
  chainId: z.number(),
});

export type Configs = z.infer<typeof ConfigSchema>;

export class WalletConfigs {
  static WALLET_CONFIG_STORAGE_KEY = 'wallet-configs';
  private static _configs: Configs = { account: null, chainId: 1 };
  private static _loaded = false;

  private static loadIfRequired() {
    if (this._loaded) return;
    const configs = LocalStorage.load<Configs>(this.WALLET_CONFIG_STORAGE_KEY, ConfigSchema);
    console.log('loaded configs:', configs);
    if (configs) this._configs = configs;
    this._loaded = true;
  }

  private static save() {
    LocalStorage.save(this.WALLET_CONFIG_STORAGE_KEY, this._configs);
  }

  static reset() {
    LocalStorage.remove(this.WALLET_CONFIG_STORAGE_KEY);
  }

  static get adapterOptionId() {
    this.loadIfRequired();
    return this._configs.adapterOptionId;
  }

  static get account() {
    this.loadIfRequired();
    return this._configs.account;
  }

  static get chainId() {
    this.loadIfRequired();
    return this._configs.chainId;
  }

  static set adapterOptionId(adapterOptionId: string | undefined) {
    this.loadIfRequired();
    this._configs.adapterOptionId = adapterOptionId;
    this.save();
  }

  static set account(account: ActiveAccount) {
    this.loadIfRequired();
    this._configs.account = account;
    this.save();
  }

  static set chainId(chainId: number) {
    this.loadIfRequired();
    this._configs.chainId = chainId;
    this.save();
  }
}
