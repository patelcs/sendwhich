'use client';

import { useWallet } from '@/providers/WalletProvider';
import { ListView } from '../list-view';
import { Coins } from 'lucide-react';
import { balanceErrorLabel, formatUnitsFixed, getBalance } from '@/web3/ERC20';
import { FIXED_DECIMALS } from '@/configs';
import { useAddressBook } from '@/address-book/AddressBookProvider';
import { TokenAddress } from '@/address-book';

export default function DashBoard() {
  const { activeAccount } = useWallet();
  const { tokenList } = useAddressBook();

  async function getBalanceText({ address, decimals, symbol, chainId }: TokenAddress): Promise<string> {
    if (!activeAccount) return "Connect wallet to see balance";
    try {
      const balance = await getBalance({ address, owner: activeAccount, chainId });
      return `${formatUnitsFixed(balance, decimals, FIXED_DECIMALS)} ${symbol}`;
    } catch (error) {
      // Full context (chain, RPC URL, token, cause) is logged by the token read layer.
      console.error(`[Dashboard] balance fetch failed for ${symbol} on chain ${chainId}`, error);
      return balanceErrorLabel(error);
    }
  }

  return (
    <>
      <ListView
        list={tokenList}
        DefaultIcon={Coins}
        getPrimaryText={(item) => item.name}
        getSecondaryText={getBalanceText}
        addHref="/address-book/tokens/add"
        defaultsLabel="Default tokens"
      />
    </>
  );
}
