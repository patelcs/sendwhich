import { Coins, Landmark, Wallet, type LucideIcon } from 'lucide-react';
import type { ContractAddress, TokenAddress, WalletAddress } from '@/address-book';
import type { ListItem } from '@/components/list-view/ListViewRow';
import { env } from '@/configs/env';

export type AddressCategory = 'tokens' | 'wallets' | 'contracts';

/** Lists a non-strict picker can browse (the mini app offers contacts only). */
export const ADDRESS_CATEGORIES: readonly AddressCategory[] = env.isMiniApp
  ? ['wallets']
  : ['tokens', 'wallets', 'contracts'];

export const CATEGORY_META: Record<AddressCategory, { label: string; Icon: LucideIcon }> = {
  tokens: { label: 'Tokens', Icon: Coins },
  wallets: { label: 'Contacts', Icon: Wallet },
  contracts: { label: 'Contracts', Icon: Landmark },
};

interface EntryByCategory {
  tokens: TokenAddress;
  wallets: WalletAddress;
  contracts: ContractAddress;
}

/** One address-book entry in a picker, tagged with the list it came from. */
export type AddressPickerItem = {
  [C in AddressCategory]: ListItem & {
    category: C;
    name: string;
    address: string;
    entry: EntryByCategory[C];
  };
}[AddressCategory];
