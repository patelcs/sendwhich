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
export type MoreSeparatorItem = {
  type: 'separator';
};
export type MoreNavigationItem = MoreLinkItem | MoreSeparatorItem;
export interface NavbarConfigs {
  links: NavigationLink[];
  linksMobile: MobileNavigationLink[];
  linksMobileMore: MoreNavigationItem[];
  showBrandInTopNavbar: boolean;
}

export interface AdapterConfigs {
  navbar: NavbarConfigs;
  connectName: string;
}
