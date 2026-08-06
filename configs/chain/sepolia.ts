import { sepolia } from "viem/chains";
import { ChainAddresses, ChainConfig } from "./types";

export const SEPOLIA_ADDRESSES: ChainAddresses = {
  multiSender: '0x9025d62b6fBc72f7027Df204Cc32a702B19Be642'
} as const;

export const SEPOLIA_CONFIGS: ChainConfig = {
  chain: sepolia,
  addresses: SEPOLIA_ADDRESSES,
} as const;