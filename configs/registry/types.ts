import { WalletRegistry } from '@/wallet-adapter';

export interface AdapterConfigs {
  showBrandInTopNavbar: boolean;
}

export interface CreateRegistryResponse {
  registry: WalletRegistry;
  defaultAdapterConfigs: AdapterConfigs;
}
