'use client';

import { useWallet } from '@/providers/WalletProvider';
import { formatAddress } from '@/lib/format';

export default function DashBoard() {
  const { chainConfig } = useWallet();
  return (
    <>
      <h1>{chainConfig?.chain.name}</h1>
      <h2>{chainConfig?.chain.id}</h2>
      <h3>
        MultiSender: {chainConfig?.contracts.multiSender && formatAddress(chainConfig.contracts.multiSender.address)}
      </h3>
    </>
  );
}
