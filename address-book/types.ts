import { Address } from '@/wallet-adapter';
import z from 'zod';

export const AddressSchema = z.string().startsWith('0x').transform(a => a as Address);

export interface IdType {
  id: string;
  type: 'default' | 'custom';
  badge?: string | undefined;
}

export const WalletAddressSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1), // string to support ENS names
  logo: z.string().optional()
});

export type WalletAddress = z.infer<typeof WalletAddressSchema> & IdType;

export const ContractAddressSchema = WalletAddressSchema.extend({
  address: AddressSchema,
  chainId: z.number(),
});
export type ContractAddress = z.infer<typeof ContractAddressSchema> & IdType;

export const TokenAddressSchema = ContractAddressSchema.extend({
  symbol: z.string().min(1),
  decimals: z.number(),
});
export type TokenAddress = z.infer<typeof TokenAddressSchema> & IdType;

export interface AddressBookEvents {
  walletListUpdated: WalletAddress[];
  contractListUpdated: ContractAddress[];
  tokenListUpdated: TokenAddress[];
}

export type OmitIdType<T extends Record<string, any>> = Omit<T, 'id' | 'type'>

export interface AddressBookInterface {
  walletList: WalletAddress[];
  contractList: ContractAddress[];
  tokenList: TokenAddress[];
  addWalletAddress(value: WalletAddress): void;
  addContractAddress(value: ContractAddress): void;
  addTokenAddress(value: TokenAddress): void;
  removeWalletAddress(address: WalletAddress['address']): void;
  removeContractAddress(address: Address, chainId: number): void;
  removeTokenAddress(address: Address, chainId: number): void;
  updateWalletAddress(address: WalletAddress['address'], value: Partial<WalletAddress>): void;
  updateContractAddress(address: Address, chainId: number, value: Partial<ContractAddress>): void;
  updateTokenAddress(address: Address, chainId: number, value: Partial<TokenAddress>): void;
}
