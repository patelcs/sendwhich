import { ROUTES } from './routes';
import type { AdapterConfigs } from './types';

export const MINIKIT_CONFIGS: AdapterConfigs = {
  routes: ROUTES,
  showBrandInTopNavbar: true,
  connectName: 'Sign In',
} as const;
