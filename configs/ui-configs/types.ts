import type { LucideIcon } from 'lucide-react';

export type NavigationLink = {
  href: string;
  label: string;
};
export type MobileNavigationLink = NavigationLink & {
  icon: LucideIcon;
};
export type MoreLinkItem = MobileNavigationLink & {
  type: 'link';
};
export interface MoreNavigationSection {
  title?: string;
  items: MoreLinkItem[];
}
export interface RouteConfig {
  navLinks: NavigationLink[];
  navLinksMobile: MobileNavigationLink[];
  navLinksMobileMore: MoreNavigationSection[];
  settingLinks: MobileNavigationLink[];
  addressBookLinks: MobileNavigationLink[];
}
export interface AdapterConfigs {
  routes: RouteConfig;
  showBrandInTopNavbar: boolean;
  connectName: string;
}
