import { worldchain } from "viem/chains";
import { ChainAddresses, ChainConfig } from "./types";

export const WORLDCHAIN_ADDRESSES: ChainAddresses = {
  multiSender: '0x9025d62b6fBc72f7027Df204Cc32a702B19Be642'
} as const;

export const WORLDCHAIN_CONFIGS: ChainConfig = {
  chain: worldchain,
  addresses: WORLDCHAIN_ADDRESSES,
} as const;