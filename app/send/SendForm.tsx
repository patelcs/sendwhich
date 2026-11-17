'use client';

import { useState } from 'react';
import { Coins } from 'lucide-react';
import { isAddress, parseUnits } from 'viem';
import type { TokenAddress } from '@/address-book';
import { useAddressBook } from '@/address-book/AddressBookProvider';
import {
  ADDRESS_CATEGORIES,
  AddressInput,
  CATEGORY_META,
  useAddressBookMatch,
  type AddressCategory,
  type AddressSelectionData,
} from '@/components/address-picker';
import { AmountInput, SubmitButton } from '@/components/form';
import { usePageTitle } from '@/components/layout/PageTitle';
import { useToast } from '@/components/ui/toast';
import ConnectButton from '@/components/wallet/WalletConnection/ConnectButton';
import { transactionErrorToast, transactionSuccessToast } from '@/components/wallet/transactionToast';
import { uiConfigs } from '@/configs';
import { getChainConfig, getChainLogo } from '@/configs/chain';
import { formatAddress } from '@/lib/format';
import { InvalidTokenAddressError, useResolvedToken, useTokenBalance, type ResolvedToken } from '@/hooks';
import { useWallet } from '@/providers/WalletProvider';
import { resolveAddress } from '@/web3/address';
import { buildTransferCall, isRpcError } from '@/web3/ERC20';

type SendStage = 'idle' | 'sending' | 'confirming';

const TOKEN_CATEGORIES: readonly AddressCategory[] = ['tokens'];
const RECIPIENT_CATEGORIES: readonly AddressCategory[] = ['wallets'];

const STAGE_LABEL: Record<SendStage, string> = {
  idle: 'Send',
  sending: 'Confirm in wallet…',
  confirming: 'Confirming…',
};

export default function SendForm() {
  const { activeAccount, chainId, sendTransaction } = useWallet();
  const { tokenList } = useAddressBook();
  const toast = useToast();
  usePageTitle('Send');

  const [tokenInput, setTokenInput] = useState('');
  const [pickedToken, setPickedToken] = useState<TokenAddress | null>(null);
  const [recipient, setRecipient] = useState('');
  const [recipientError, setRecipientError] = useState<string>();
  const [amount, setAmount] = useState('');
  const [stage, setStage] = useState<SendStage>('idle');

  // A token picked from the book carries its own chain; a pasted one is looked up on the wallet's chain.
  const tokenChainId = pickedToken?.chainId ?? chainId;
  const token = useResolvedToken(tokenInput, tokenChainId, tokenList, pickedToken);
  const balance = useTokenBalance(token.value, activeAccount);
  const amountState = parseAmount(amount, token.value, balance.value);
  const recipientMatch = useAddressBookMatch(recipient, ADDRESS_CATEGORIES, token.value?.chainId ?? tokenChainId);
  const recipientComplete = isAddress(recipient, { strict: false }) || /\.eth$/i.test(recipient);

  const isBusy = stage !== 'idle';
  const canSubmit = !!activeAccount && !!token.value && !!recipient && amountState.raw !== undefined && !isBusy;

  function handleTokenInput(value: string) {
    setTokenInput(value);
    setPickedToken(null);
    setAmount('');
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit || !token.value || amountState.raw === undefined) return;
    const sendToken = token.value;
    const raw = amountState.raw;
    const recipientName = recipientMatch?.name;

    let to;
    try {
      to = await resolveAddress(recipient);
    } catch (error) {
      console.error('[Send] recipient resolution failed', { recipient, error });
      setRecipientError('Not a valid address or ENS name');
      return;
    }

    // Address-book name if known, else the ENS name typed, else the shortened address.
    const toLabel = recipientName ?? (isAddress(recipient, { strict: false }) ? formatAddress(to) : recipient.trim());

    setStage('sending');
    try {
      console.info('[Send] transfer', { token: sendToken, to, amount, raw });
      const tx = await sendTransaction({
        chainId: sendToken.chainId,
        calls: [buildTransferCall({ address: sendToken.address, to, amount: raw })],
      });
      setStage('confirming');
      const hash = await tx.wait();
      toast(transactionSuccessToast(sendToken.chainId, hash, `Sent ${amount} ${sendToken.symbol} to ${toLabel}`));
      setAmount('');
      balance.reload();
    } catch (error) {
      console.error('[Send] transfer failed', { token: sendToken, to, raw, error });
      toast(transactionErrorToast(error));
    } finally {
      setStage('idle');
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AddressInput
          id="send-token"
          label="Token"
          placeholder={uiConfigs.customTokenInput ? 'Token address (0x…)' : 'Select a token'}
          pickerOnly={!uiConfigs.customTokenInput}
          pickerTitle="Select token"
          categories={TOKEN_CATEGORIES}
          strictSelection
          value={tokenInput}
          onChange={handleTokenInput}
          onPick={(item) => item.category === 'tokens' && setPickedToken(item.entry)}
          selection={token.value && tokenSelection(token.value)}
          disabled={isBusy}
          error={tokenError(token.error, tokenChainId)}
          hint={
            token.loading
              ? 'Looking up token…'
              : token.value && !token.value.fromAddressBook && 'Not in your address book — double-check the address'
          }
        />

        <AddressInput
          id="send-recipient"
          label="Recipient"
          pickerTitle="Select recipient"
          categories={RECIPIENT_CATEGORIES}
          chainId={token.value?.chainId}
          selection={recipientMatch && recipientSelection(recipientMatch)}
          complete={recipientComplete}
          value={recipient}
          onChange={(value) => {
            setRecipient(value);
            setRecipientError(undefined);
          }}
          disabled={isBusy}
          error={recipientError}
        />

        <AmountInput
          id="send-amount"
          label="Amount"
          value={amount}
          onChange={setAmount}
          decimals={token.value?.decimals}
          symbol={token.value?.symbol}
          balance={activeAccount && token.value ? balance : undefined}
          error={amountState.error}
          disabled={isBusy}
        />

        <div className="pt-1">
          {activeAccount ? (
            <SubmitButton loading={isBusy} disabled={!canSubmit} className="w-full">
              {STAGE_LABEL[stage]}
            </SubmitButton>
          ) : (
            <ConnectButton className="h-12 w-full text-base" />
          )}
        </div>
      </form>
    </div>
  );
}

function tokenSelection(token: ResolvedToken): AddressSelectionData {
  return {
    // Same layout as the picker rows; the chain is shown by the badge on the logo.
    title: `${token.name} · ${token.symbol}`,
    subtitle: formatAddress(token.address),
    logo: token.logo,
    badge: getChainLogo(token.chainId),
    DefaultIcon: Coins,
  };
}

function recipientSelection(item: NonNullable<ReturnType<typeof useAddressBookMatch>>): AddressSelectionData {
  return {
    title: item.name,
    subtitle: formatAddress(item.address),
    logo: item.logo,
    badge: item.badge,
    DefaultIcon: CATEGORY_META[item.category].Icon,
  };
}

function tokenError(error: unknown, chainId: number): string | undefined {
  if (!error) return undefined;
  if (error instanceof InvalidTokenAddressError) return error.message;
  if (isRpcError(error)) return 'RPC Error: could not load this token';
  return `Not an ERC20 token on ${getChainConfig(chainId).chain.name}`;
}

/** Parses the typed amount against the token's decimals and the known balance. */
function parseAmount(
  amount: string,
  token: ResolvedToken | undefined,
  balance: bigint | undefined,
): { raw?: bigint; error?: string } {
  if (!amount || !token) return {};
  let raw: bigint;
  try {
    raw = parseUnits(amount, token.decimals);
  } catch {
    return { error: 'Invalid amount' };
  }
  if (raw <= BigInt(0)) return { error: 'Amount must be greater than 0' };
  if (balance !== undefined && raw > balance) return { error: 'Insufficient balance' };
  return { raw };
}
