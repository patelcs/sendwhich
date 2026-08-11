import {
  ArrowLeftRight,
  BookOpen,
  Coins,
  Landmark,
  MessageCircle,
  Send,
  Settings2,
  Wallet,
  WalletMinimal,
  Waypoints,
} from 'lucide-react';
import { DISCORD_URL, DOC_URL } from '@/lib/constants';
import type { MobileNavigationLink, MoreNavigationSection, NavigationLink } from './types';

export const NAV_LINKS: NavigationLink[] = [
  { href: '/', label: 'Portfolio' },
  { href: '/send', label: 'Send' },
  { href: '/swap', label: 'Swap' },
  { href: '/address-book', label: 'Address Book' },
  { href: '/settings', label: 'Settings' },
  // { href: DOC_URL, label: 'Docs' },
] as const;

export const NAV_LINKS_MOBILE: MobileNavigationLink[] = [
  { href: '/', label: 'Portfolio', icon: WalletMinimal },
  { href: '/send', label: 'Send', icon: Send },
  { href: '/swap', label: 'Swap', icon: ArrowLeftRight },
] as const;

export const ADDRESS_BOOK_LINKS: MobileNavigationLink[] = [
  { href: '/address-book/tokens', label: 'Tokens', icon: Coins },
  { href: '/address-book/wallets', label: 'Wallets', icon: Wallet },
  { href: '/address-book/contracts', label: 'Contracts', icon: Landmark },
] as const;

export const SETTINGS_NAV_LINKS: MobileNavigationLink[] = [
  { href: '/settings/general', label: 'General', icon: Settings2 },
  { href: '/settings/chains', label: 'Chains', icon: Waypoints },
] as const;

export const NAV_LINKS_MOBILE_MORE: MoreNavigationSection[] = [
  {
    title: 'Address Book',
    items: ADDRESS_BOOK_LINKS.map((link) => ({ ...link, type: 'link' as const })),
  },
  {
    title: 'Settings',
    items: SETTINGS_NAV_LINKS.map((link) => ({ ...link, type: 'link' as const })),
  },
  // {
  //   items: [
  //     { type: 'link', href: DOC_URL, label: 'Documentation', icon: BookOpen },
  //     { type: 'link', href: DISCORD_URL, label: 'Discord community', icon: MessageCircle },
  //   ],
  // },
] as const;

export const ROUTES = {
  navLinks: NAV_LINKS,
  navLinksMobile: NAV_LINKS_MOBILE,
  navLinksMobileMore: NAV_LINKS_MOBILE_MORE,
  settingLinks: SETTINGS_NAV_LINKS,
  addressBookLinks: ADDRESS_BOOK_LINKS,
} as const;
