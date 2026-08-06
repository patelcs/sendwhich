"use client"

import { useWallet } from "@/providers/WalletProvider";

function formatAddress(account: string) {
  return `${account.slice(0, 6)}…${account.slice(-4)}`;
}

export default function DashBoard() {
  const { chainConfig } = useWallet();
  return (
    <>
      <h1>{chainConfig?.chain.name}</h1>
      <h2>{chainConfig?.chain.id}</h2>
      <h3>MultiSender: {chainConfig?.addresses.multiSender && formatAddress(chainConfig.addresses.multiSender)}</h3>
    </>
  );
}