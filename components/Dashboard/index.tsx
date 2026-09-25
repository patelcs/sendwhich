'use client';

import { useWallet } from '@/providers/WalletProvider';
import { getChainTokens } from '@/configs/chain';
import { ListView } from '../list-view';
import { Coins } from 'lucide-react';
import { ERC20Utils } from '@/web3/utils';

export default function DashBoard() {
  const { activeAccount, chainId } = useWallet();
  const tokens = getChainTokens(chainId).map((i, idx) => ({ ...i, type: 'default', id: `${i.address}${idx}` }));
  return (
    <>
      <ListView
        list={tokens}
        DefaultIcon={Coins}
        getPrimaryText={(item) => item.name}
        getSecondaryText={async (item) =>
          activeAccount ? await ERC20Utils.getBalance({ ...item, holder: activeAccount, output: 'ffs', chainId }) : '!!'
        }
      />
    </>
  );
}
