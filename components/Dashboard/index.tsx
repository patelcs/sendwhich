'use client';

import { useWallet } from '@/providers/WalletProvider';
import { ListView } from '../list-view';
import { Coins } from 'lucide-react';
import { getFormattedBalance, isRpcError } from '@/web3/ERC20';
import { useAddressBook } from '@/address-book/AddressBookProvider';
import { TokenAddress } from '@/address-book';

export default function DashBoard() {
  const { activeAccount } = useWallet();
  const { tokenList } = useAddressBook();

  async function getBalance({ address, decimals, symbol, chainId }: TokenAddress): Promise<string> {
    if (!activeAccount) return "Connect wallet to see balance";
    try {
      const balance = await getFormattedBalance({ address, owner: activeAccount, decimals, chainId });
      return `${balance} ${symbol}`;
    } catch (error) {
      // Full context (chain, RPC URL, token, cause) is logged by the ERC20 read layer.
      console.error(`[Dashboard] balance fetch failed for ${symbol} on chain ${chainId}`, error);
      return isRpcError(error) ? 'RPC Error' : 'Balance Error';
    }
  }

  return (
    <>
      <ListView
        list={tokenList}
        DefaultIcon={Coins}
        getPrimaryText={(item) => item.name}
        getSecondaryText={getBalance}
        addHref="/address-book/tokens/add"
        defaultsLabel="Default tokens"
      />
    </>
  );
}
