import { ArrowLeftRight, BookOpen, MessageCircle, Send, WalletMinimal, Wrench } from 'lucide-react';
import { DISCORD_URL, DOC_URL } from '@/lib/constants';
import type { MobileNavigationLink, MoreNavigationItem, NavbarConfigs, NavigationLink } from './types';

export const NAV_LINKS: NavigationLink[] = [
  { href: '/', label: 'Portfolio' },
  { href: '/send', label: 'Send' },
  { href: '/swap', label: 'Swap' },
  { href: '/tools', label: 'Tools' },
  { href: DOC_URL, label: 'Docs' },
] as const;

export const NAV_LINKS_MOBILE: MobileNavigationLink[] = [
  { href: '/', label: 'Portfolio', icon: WalletMinimal },
  { href: '/send', label: 'Send', icon: Send },
  { href: '/swap', label: 'Swap', icon: ArrowLeftRight },
] as const;

export const NAV_LINKS_MOBILE_MORE: MoreNavigationItem[] = [
  // { type: 'link', href: '/tools', label: 'Tools', icon: Wrench },
  // { type: 'separator' },
  { type: 'link', href: DOC_URL, label: 'Documentation', icon: BookOpen },
  {
    type: 'link',
    href: DISCORD_URL,
    label: 'Discord community',
    icon: MessageCircle,
  },
] as const;
