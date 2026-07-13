import { WalletUIConfigs } from './WalletUIConfigs';

export interface WalletAdapter {
  uiConfigs: WalletUIConfigs;
  initialize: () => Promise<void>;
  connect: () => Promise<void>;
}
