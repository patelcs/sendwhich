import { AdapterId } from '@/wallet-adapter';
import { AdapterConfigs } from './types';
import { BROWSER_CONFIGS } from './browserConfigs';
import { MINIKIT_CONFIGS } from './minikitConfigs';

export function getAdapterConfigs(adapterId: AdapterId): AdapterConfigs {
  switch (adapterId) {
    case 'injected-wallet-adapter':
      return BROWSER_CONFIGS;
    case 'minikit-wallet-adapter':
      return MINIKIT_CONFIGS;
    default:
      throw new Error(`No adapter configs available for id ${adapterId}`);
  }
}
