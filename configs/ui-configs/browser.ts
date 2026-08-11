import { ROUTES } from './routes';
import type { AdapterConfigs } from './types';

export const BROWSER_CONFIGS: AdapterConfigs = {
  routes: ROUTES,
  showBrandInTopNavbar: true,
  connectName: 'Connect Wallet',
} as const;
