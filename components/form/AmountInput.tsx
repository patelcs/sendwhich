'use client';

import { formatUnits } from 'viem';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FIXED_DECIMALS } from '@/configs';
import { sanitizeDecimalInput } from '@/lib/format';
import { balanceErrorLabel, formatUnitsFixed } from '@/web3/ERC20';

export interface AmountBalance {
  value: bigint | undefined;
  loading: boolean;
  error: unknown;
}

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Max fraction digits accepted; `undefined` disables the input until the token is known. */
  decimals: number | undefined;
  symbol?: string | undefined;
  /** Shown top-right with a Max button. */
  balance?: AmountBalance | undefined;
  error?: string | undefined;
  disabled?: boolean;
}

export function AmountInput({ id, label, value, onChange, decimals, symbol, balance, error, disabled }: Props) {
  const isDisabled = disabled || decimals === undefined;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {balance && decimals !== undefined && (
          <BalanceLabel balance={balance} decimals={decimals} symbol={symbol} onMax={onChange} disabled={disabled} />
        )}
      </div>
      <div className="relative">
        <Input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.0"
          value={value}
          disabled={isDisabled}
          onChange={(event) => onChange(sanitizeDecimalInput(event.target.value, decimals ?? 0))}
          aria-invalid={!!error}
          className={`font-mono ${symbol ? 'pr-20' : ''}`}
        />
        {symbol && (
          <span className="pointer-events-none absolute top-1/2 right-3 max-w-16 -translate-y-1/2 truncate text-base text-(--muted)">
            {symbol}
          </span>
        )}
      </div>
      {error && <p className="text-sm text-(--danger)">{error}</p>}
    </div>
  );
}

function BalanceLabel({
  balance,
  decimals,
  symbol,
  onMax,
  disabled,
}: {
  balance: AmountBalance;
  decimals: number;
  symbol?: string | undefined;
  onMax: (value: string) => void;
  disabled?: boolean | undefined;
}) {
  const { value, loading, error } = balance;

  let text: React.ReactNode;
  if (loading) text = <span className="inline-block h-[1em] w-14 animate-pulse rounded-sm bg-(--accent) align-middle" />;
  else if (error) text = <span className="text-(--danger)">{balanceErrorLabel(error)}</span>;
  else if (value !== undefined) text = `${formatUnitsFixed(value, decimals, FIXED_DECIMALS)} ${symbol ?? ''}`;
  else return null;

  return (
    <div className="flex min-w-0 items-center gap-2 text-sm text-(--muted)">
      <span className="truncate">Balance: {text}</span>
      <button
        type="button"
        disabled={disabled || !value}
        // Full precision, not the rounded display value, so Max sends the entire balance.
        onClick={() => value && onMax(formatUnits(value, decimals))}
        className="shrink-0 rounded-md border border-(--brand)/30 bg-(--brand)/10 px-1.5 py-0.5 font-semibold text-(--brand) transition-colors hover:bg-(--brand)/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Max
      </button>
    </div>
  );
}
