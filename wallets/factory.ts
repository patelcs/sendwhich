import { MiniKit } from "@worldcoin/minikit-js";
import { MiniAppWallet } from "./providers/MiniAppWallet";
import { WalletAdapter } from "./adapter/WalletAdapter";
import { WagmiWallet } from "./providers/WagmiWallet";

export function createWallet(): WalletAdapter {
  const { success } = MiniKit.install();
  if (success) {
    return new MiniAppWallet();
  }
  return new WagmiWallet();
}