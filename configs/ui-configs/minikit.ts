import { moreNavigationSections, ROUTES, WALLETS_LINK } from './routes';
import type { AdapterConfigs } from './types';

export const MINIKIT_CONFIGS: AdapterConfigs = {
  // The More menu's address book offers contacts only.
  routes: { ...ROUTES, navLinksMobileMore: moreNavigationSections([WALLETS_LINK]) },
  showBrandInTopNavbar: true,
  connectName: 'Sign In',
  defaultsFilter: false,
  dashboardAddButton: false,
  // MiniKit can only send tokens whitelisted in the Developer Portal: no arbitrary token addresses.
  customTokenInput: false,
} as const;
