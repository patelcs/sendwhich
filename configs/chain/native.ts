import { isAddress, isAddressEqual, zeroAddress, type Chain } from 'viem';
import type { TokenAddress } from './types';

/** The zero address stands for the chain's native currency (ETH) everywhere a token address is expected. */
export const NATIVE_TOKEN_ADDRESS = zeroAddress;

export function isNativeToken(address: string): boolean {
  return isAddress(address, { strict: false }) && isAddressEqual(address, NATIVE_TOKEN_ADDRESS);
}

export const ETH_LOGO = '/logo/ethereum.png';

export function nativeToken(chain: Chain, logo: string = ETH_LOGO): TokenAddress {
  const { name, symbol, decimals } = chain.nativeCurrency;
  return { name, symbol, decimals, address: NATIVE_TOKEN_ADDRESS, logo };
}
