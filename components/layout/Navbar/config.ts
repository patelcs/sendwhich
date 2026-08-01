import { ArrowLeftRight, BookOpen, MessageCircle, Send, WalletMinimal, Wrench } from 'lucide-react';
import { DISCORD_URL, DOC_URL } from '@/lib/constants';
import type { MobileNavigationLink, MoreNavigationItem, NavigationLink } from './types';

export const NAV_LINKS: NavigationLink[] = [
  { href: '/', label: 'Portfolio' },
  { href: '/send', label: 'Send' },
  { href: '/swap', label: 'Swap' },
  { href: '/tools', label: 'Tools' },
  { href: DOC_URL, label: 'Docs' },
];

export const MOBILE_NAV_LINKS: MobileNavigationLink[] = [
  { href: '/', label: 'Portfolio', icon: WalletMinimal },
  { href: '/send', label: 'Send', icon: Send },
  { href: '/swap', label: 'Swap', icon: ArrowLeftRight },
];

export const MORE_LINKS: MoreNavigationItem[] = [
  { type: 'link', href: '/tools', label: 'Tools', icon: Wrench },
  { type: 'separator' },
  { type: 'link', href: DOC_URL, label: 'Documentation', icon: BookOpen },
  {
    type: 'link',
    href: DISCORD_URL,
    label: 'Discord community',
    icon: MessageCircle,
  },
];
