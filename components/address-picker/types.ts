import { Coins, Landmark, Wallet, type LucideIcon } from 'lucide-react';
import type { ContractAddress, TokenAddress, WalletAddress } from '@/address-book';
import type { ListItem } from '@/components/list-view/ListViewRow';

export type AddressCategory = 'tokens' | 'wallets' | 'contracts';

export const ADDRESS_CATEGORIES: readonly AddressCategory[] = ['tokens', 'wallets', 'contracts'];

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
