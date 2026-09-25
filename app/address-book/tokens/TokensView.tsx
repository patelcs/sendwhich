'use client';

import { useMemo, useState } from 'react';
import { Coins } from 'lucide-react';
import { useAddressBook } from '@/address-book/AddressBookProvider';
import type { Address, TokenAddress } from '@/address-book';
import { getAllChains, getChainConfig, getChainTokens } from '@/configs/chain';
import { useWallet } from '@/providers/WalletProvider';
import SelectableList, { highlightMatch } from '@/components/list/SelectableList';
import { ChainFilter } from '@/components/list/ChainFilter';
import TokenForm from './TokenForm';

type TokenEntry = TokenAddress & { icon?: string; isDefault?: boolean };

type ViewState = { mode: 'list' } | { mode: 'add' } | { mode: 'edit'; entry: TokenAddress };

export default function TokensView() {
  const { tokenList, removeTokenAddress } = useAddressBook();
  const { chainId } = useWallet();
  const [view, setView] = useState<ViewState>({ mode: 'list' });
  const [chainFilter, setChainFilter] = useState<number[]>([chainId]);
  const [showDefaults, setShowDefaults] = useState(true);
  const allChains = useMemo(() => getAllChains().map(({ chain }) => chain), []);

  const backToList = () => setView({ mode: 'list' });

  const defaultTokens = useMemo<TokenEntry[]>(
    () =>
      allChains.flatMap((chain) =>
        getChainTokens(chain.id).map((token) => ({ ...token, chainId: chain.id, isDefault: true as const })),
      ),
    [allChains],
  );

  const combinedList = useMemo<TokenEntry[]>(
    () => (showDefaults ? [...tokenList, ...defaultTokens] : tokenList),
    [tokenList, defaultTokens, showDefaults],
  );

  const filteredList = useMemo(
    () =>
      chainFilter.length === 0 ? combinedList : combinedList.filter((entry) => chainFilter.includes(entry.chainId)),
    [combinedList, chainFilter],
  );

  return (
    <div className="flex h-[calc(100dvh-148px-env(safe-area-inset-bottom))] flex-col gap-4 md:h-[calc(100dvh-144px-env(safe-area-inset-bottom))]">
      {view.mode !== 'list' ? (
        <TokenForm entry={view.mode === 'edit' ? view.entry : undefined} onDone={backToList} onCancel={backToList} />
      ) : (
        <SelectableList
          items={filteredList}
          getId={(entry) =>
            entry.isDefault ? `default:${entry.address}:${entry.chainId}` : `${entry.address}:${entry.chainId}`
          }
          getLabel={(entry) => entry.name}
          icon={Coins}
          searchPlaceholder="Search by name, symbol, or address"
          searchPredicate={(entry, q) =>
            entry.name.toLowerCase().includes(q) ||
            entry.symbol.toLowerCase().includes(q) ||
            entry.address.toLowerCase().includes(q)
          }
          getPrimary={(entry, query) => (
            <>
              {highlightMatch(entry.name, query)}{' '}
              <span className="text-(--muted)">· {highlightMatch(entry.symbol, query)}</span>
            </>
          )}
          getMeta={(entry) => {
            const chainName = getChainConfig(entry.chainId)?.chain.name ?? `Chain ${entry.chainId}`;
            return `${entry.chainId} · ${chainName}`;
          }}
          getSecondary={(entry, query) => highlightMatch(entry.address, query)}
          renderIcon={(entry) =>
            entry.icon ? <img src={entry.icon} alt="" className="size-full rounded-full object-cover" /> : undefined
          }
          renderBadge={(entry) =>
            entry.isDefault ? (
              <img
                src="/badge-default.svg"
                alt="Default"
                className="absolute -right-1 -bottom-1 size-5 rounded-full border border-(--card)"
              />
            ) : undefined
          }
          isReadOnly={(entry) => Boolean(entry.isDefault)}
          onAdd={() => setView({ mode: 'add' })}
          onActivate={(entry) => {
            if (!entry.isDefault) setView({ mode: 'edit', entry });
          }}
          onDeleteSelected={(ids) =>
            ids.forEach((id) => {
              const entry = tokenList.find((t) => `${t.address}:${t.chainId}` === id);
              if (entry) removeTokenAddress(entry.address as Address, entry.chainId);
            })
          }
          emptyLabel="No addresses found."
          toolbarExtra={
            <ChainFilter
              chains={allChains}
              activeChainId={chainId}
              selected={chainFilter}
              onChange={setChainFilter}
              defaultsLabel="Verified Tokens"
              showDefaults={showDefaults}
              onShowDefaultsChange={setShowDefaults}
            />
          }
        />
      )}
    </div>
  );
}
