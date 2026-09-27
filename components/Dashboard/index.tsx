'use client';

import { useWallet } from '@/providers/WalletProvider';
import { getChainTokens } from '@/configs/chain';
import { ListView } from '../list-view';
import { Coins } from 'lucide-react';
import { getFormattedBalance } from '@/web3/ERC20';
import { Address } from '@/wallet-adapter';

export default function DashBoard() {
  const { activeAccount, chainId } = useWallet();
  const tokens = getChainTokens(chainId).map((i, idx) => ({ ...i, type: 'default', id: `${i.address}${idx}`, chainId }));

  async function getBalance({ address, decimals, symbol, chainId }: { address: Address, decimals: number, symbol: string, chainId: number }): Promise<string> {
    if (!activeAccount) return "!!!";
    const balance = await getFormattedBalance({ address, owner: activeAccount, decimals, chainId });
    return `${balance} ${symbol}`;
  }

  return (
    <>
      <ListView
        list={tokens}
        DefaultIcon={Coins}
        getPrimaryText={(item) => item.name}
        getSecondaryText={getBalance}
      />
    </>
  );
}
