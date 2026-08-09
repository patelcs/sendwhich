import { NAV_LINKS, NAV_LINKS_MOBILE, NAV_LINKS_MOBILE_MORE, SETTINGS_NAV_LINKS } from './routes';
import type { AdapterConfigs } from './types';

export const BROWSER_CONFIGS: AdapterConfigs = {
  routes: {
    navLinks: NAV_LINKS,
    navLinksMobile: NAV_LINKS_MOBILE,
    navLinksMobileMore: NAV_LINKS_MOBILE_MORE,
    settingLinks: SETTINGS_NAV_LINKS,
  },
  showBrandInTopNavbar: true,
  connectName: 'Connect Wallet'
} as const;
