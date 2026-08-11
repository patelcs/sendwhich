import z from 'zod';

export const AddressSchema = z.string();
export type Address = z.infer<typeof AddressSchema>;

export const WalletAddressSchema = z.object({
  name: z.string(),
  address: AddressSchema,
});
export type WalletAddress = z.infer<typeof WalletAddressSchema>;

export const ContractAddressSchema = WalletAddressSchema.extend({
  chainId: z.number(),
});
export type ContractAddress = z.infer<typeof ContractAddressSchema>;

export const TokenAddressSchema = ContractAddressSchema.extend({
  symbol: z.string(),
  decimals: z.number(),
});
export type TokenAddress = z.infer<typeof TokenAddressSchema>;

export interface AddressBookEvents {
  walletListUpdated: WalletAddress[];
  contractListUpdated: ContractAddress[];
  tokenListUpdated: TokenAddress[];
}

export interface AddressBookInterface {
  walletList: WalletAddress[];
  contractList: ContractAddress[];
  tokenList: TokenAddress[];
  addWalletAddress(value: WalletAddress): void;
  addContractAddress(value: ContractAddress): void;
  addTokenAddress(value: TokenAddress): void;
  removeWalletAddress(address: Address): void;
  removeContractAddress(address: Address, chainId: number): void;
  removeTokenAddress(address: Address, chainId: number): void;
  updateWalletAddress(address: Address, value: Partial<WalletAddress>): void;
  updateContractAddress(address: Address, chainId: number, value: Partial<ContractAddress>): void;
  updateTokenAddress(address: Address, chainId: number, value: Partial<TokenAddress>): void;
}
