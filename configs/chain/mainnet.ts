import { mainnet } from "viem/chains";
import { ChainAddresses, ChainConfig } from "./types";

export const MAINNET_ADDRESSES: ChainAddresses = {
} as const;

export const MAINNET_CONFIGS: ChainConfig = {
  chain: mainnet,
  addresses: MAINNET_ADDRESSES,
} as const;