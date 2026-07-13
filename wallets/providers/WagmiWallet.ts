import { WalletAdapter } from "../adapter/WalletAdapter";
import { WalletUIConfigs } from "../adapter/WalletUIConfigs";
import { MiniKit } from "@worldcoin/minikit-js";
import type {
  CommandResultByVia,
  MiniKitWalletAuthOptions,
  WalletAuthResult,
} from "@worldcoin/minikit-js/commands";

export class WagmiWallet implements WalletAdapter {
  uiConfigs: WalletUIConfigs = {
    navbarType: "Top"
  };

  async initialize() { }

  async connect() { };
}