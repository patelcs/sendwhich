import { NAV_LINKS, NAV_LINKS_MOBILE, NAV_LINKS_MOBILE_MORE } from './navbar';
import type { AdapterConfigs } from './types';

export const BROWSER_CONFIGS: AdapterConfigs = {
  navbar: {
    links: NAV_LINKS,
    linksMobile: NAV_LINKS_MOBILE,
    linksMobileMore: NAV_LINKS_MOBILE_MORE,
    showBrandInTopNavbar: true,
  }
} as const;
