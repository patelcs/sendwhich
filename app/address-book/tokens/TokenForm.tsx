'use client';

import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useAddressBook } from '@/address-book/AddressBookProvider';
import { TokenAddressSchema, type TokenAddress } from '@/address-book';
import { InputField } from '@/components/form/InputField';
import { AddressField } from '@/components/form';
import { ChainField } from '@/components/form/ChainField';
import { FormLayout } from '@/components/form/FormLayout';
import { useWallet } from '@/providers/WalletProvider';
import { getTokenInfo, resolveAddress } from '@/web3/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getAllChains } from '@/configs/chain';

interface TokenFormValues {
  name: string;
  address: string;
  chainId: number;
  symbol: string;
  decimals: string;
}

interface TokenFormProps {
  entry?: TokenAddress;
  onDone: () => void;
  onCancel: () => void;
}

const AUTO_FILL_DEBOUNCE_MS = 600;

const AUTO_FILL_FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'symbol', label: 'Symbol' },
  { key: 'decimals', label: 'Decimals' },
] as const;

interface OnChainValues {
  name: string;
  symbol: string;
  decimals: string;
}

interface ConflictField {
  key: keyof OnChainValues;
  label: string;
  formValue: string;
  onChainValue: string;
}

interface FieldConflict {
  onChainValues: OnChainValues;
  fields: ConflictField[];
}

function buildFieldConflicts(values: OnChainValues, onChainValues: OnChainValues): ConflictField[] {
  return AUTO_FILL_FIELDS.filter(({ key }) => {
    const formValue = values[key].trim();
    return formValue && formValue !== onChainValues[key];
  }).map(({ key, label }) => ({
    key,
    label,
    formValue: values[key].trim(),
    onChainValue: onChainValues[key],
  }));
}

function FieldConflictTable({ fields }: { fields: ConflictField[] }) {
  return (
    <table className="w-full table-fixed border-separate border-spacing-0 overflow-hidden rounded-lg border border-(--border) text-sm">
      <thead>
        <tr>
          <th className="border-b border-(--border) px-3 py-2 text-left text-xs font-medium text-(--muted)" />
          <th className="border-b border-(--border) bg-(--input-bg) px-3 py-2 text-left text-xs font-medium text-(--muted)">
            In form
          </th>
          <th className="border-b border-(--border) bg-(--input-bg) px-3 py-2 text-left text-xs font-medium text-(--muted)">
            On-chain
          </th>
        </tr>
      </thead>
      <tbody>
        {fields.map(({ key, label, formValue, onChainValue }, index) => (
          <tr key={key}>
            <th
              scope="row"
              className={`px-3 py-2 text-left text-xs font-medium text-(--muted) ${index !== 0 ? 'border-t border-(--border)' : ''}`}
            >
              {label}
            </th>
            <td
              className={`truncate px-3 py-2 font-mono text-(--foreground) ${index !== 0 ? 'border-t border-(--border)' : ''}`}
            >
              {formValue}
            </td>
            <td
              className={`truncate px-3 py-2 font-mono text-(--foreground) ${index !== 0 ? 'border-t border-(--border)' : ''}`}
            >
              {onChainValue}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type ConflictSource = 'form' | 'onchain';

function FieldConflictPicker({
  fields,
  selected,
  onSelect,
}: {
  fields: ConflictField[];
  selected: ConflictSource;
  onSelect: (source: ConflictSource) => void;
}) {
  return (
    <RadioGroup
      value={selected}
      onValueChange={(value) => onSelect(value as ConflictSource)}
      className="grid-cols-2 items-start gap-3"
    >
      <Label className="flex cursor-pointer flex-col gap-3 rounded-lg border border-(--border) bg-(--input-bg) p-3 text-(--foreground) has-data-checked:border-(--brand)/40 has-data-checked:bg-(--brand)/10">
        <span className="flex items-center gap-2 text-xs font-medium text-(--muted)">
          <RadioGroupItem value="form" />
          In form
        </span>
        <div className="flex flex-col gap-2">
          {fields.map((field) => (
            <div key={field.key}>
              <p className="text-xs text-(--muted)">{field.label}</p>
              <p className="truncate font-mono text-sm">{field.formValue}</p>
            </div>
          ))}
        </div>
      </Label>
      <Label className="flex cursor-pointer flex-col gap-3 rounded-lg border border-(--border) bg-(--input-bg) p-3 text-(--foreground) has-data-checked:border-(--brand)/40 has-data-checked:bg-(--brand)/10">
        <span className="flex items-center gap-2 text-xs font-medium text-(--muted)">
          <RadioGroupItem value="onchain" />
          On-chain
        </span>
        <div className="flex flex-col gap-2">
          {fields.map((field) => (
            <div key={field.key}>
              <p className="text-xs text-(--muted)">{field.label}</p>
              <p className="truncate font-mono text-sm">{field.onChainValue}</p>
            </div>
          ))}
        </div>
      </Label>
    </RadioGroup>
  );
}

export default function TokenForm({ entry, onDone, onCancel }: TokenFormProps) {
  const { addTokenAddress, updateTokenAddress } = useAddressBook();
  const { chainId } = useWallet();
  const [error, setError] = useState<string | null>(null);
  const [autoFillConflict, setAutoFillConflict] = useState<FieldConflict | null>(null);
  const [saveConflict, setSaveConflict] = useState<{ data: TokenFormValues; conflict: FieldConflict } | null>(null);
  const [selectedConflictSource, setSelectedConflictSource] = useState<ConflictSource>('onchain');
  const [unverifiedToken, setUnverifiedToken] = useState<TokenFormValues | null>(null);
  const allChains = useMemo(() => getAllChains().map(({ chain }) => chain), []);
  const isEdit = entry !== undefined;

  const form = useForm<TokenFormValues>({
    defaultValues: {
      name: entry?.name ?? '',
      address: entry?.address ?? '',
      chainId: entry?.chainId ?? chainId,
      symbol: entry?.symbol ?? '',
      decimals: entry ? String(entry.decimals) : '',
    },
  });

  const watchedAddress = useWatch({ control: form.control, name: 'address' });
  const watchedChainId = useWatch({ control: form.control, name: 'chainId' });

  useEffect(() => {
    const trimmedAddress = watchedAddress?.trim();
    if (!trimmedAddress) return;

    let cancelled = false;

    const timeout = setTimeout(async () => {
      if (form.formState.isSubmitting) return;

      try {
        const resolvedAddress = await resolveAddress(trimmedAddress);
        const [name, symbol, decimals] = await getTokenInfo(resolvedAddress as `0x${string}`, watchedChainId);
        if (cancelled || form.formState.isSubmitting) return;

        const onChainValues: OnChainValues = {
          name: String(name),
          symbol: String(symbol),
          decimals: String(decimals),
        };
        const conflicts = buildFieldConflicts(form.getValues(), onChainValues);

        if (conflicts.length > 0) {
          setAutoFillConflict({ onChainValues, fields: conflicts });
          return;
        }

        form.setValue('name', onChainValues.name, { shouldValidate: true });
        form.setValue('symbol', onChainValues.symbol, { shouldValidate: true });
        form.setValue('decimals', onChainValues.decimals, { shouldValidate: true });
      } catch {
        // Not a readable ERC20 contract on this chain; leave the fields for manual entry.
      }
    }, AUTO_FILL_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [watchedAddress, watchedChainId, form]);

  function saveEntry(data: TokenFormValues, decimals: number) {
    const result = TokenAddressSchema.safeParse({
      name: data.name.trim(),
      address: data.address.trim(),
      chainId: data.chainId,
      symbol: data.symbol.trim(),
      decimals,
    });
    if (!result.success) {
      form.setError('address', { type: 'manual', message: result.error.issues[0]?.message ?? 'Invalid input' });
      return;
    }

    try {
      if (isEdit) {
        updateTokenAddress(entry.address, entry.chainId, result.data);
      } else {
        addTokenAddress(result.data);
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  async function handleSubmit(data: TokenFormValues) {
    setError(null);

    let resolvedAddress: string;
    try {
      resolvedAddress = await resolveAddress(data.address);
    } catch (err) {
      form.setError('address', {
        type: 'manual',
        message: err instanceof Error ? err.message : 'Invalid address',
      });
      return;
    }

    let onChainValues: OnChainValues;
    try {
      const [name, symbol, decimals] = await getTokenInfo(resolvedAddress as `0x${string}`, data.chainId);
      onChainValues = { name: String(name), symbol: String(symbol), decimals: String(decimals) };
    } catch {
      setUnverifiedToken(data);
      return;
    }

    const conflicts = buildFieldConflicts(data, onChainValues);
    if (conflicts.length > 0) {
      setSaveConflict({ data, conflict: { onChainValues, fields: conflicts } });
      setSelectedConflictSource('onchain');
      return;
    }

    saveEntry(data, Number(data.decimals));
  }

  function closeSaveConflict() {
    setSaveConflict(null);
    setSelectedConflictSource('onchain');
  }

  function handleConfirmSaveConflict() {
    if (!saveConflict) return;
    const { data, conflict } = saveConflict;
    const useOnChain = selectedConflictSource === 'onchain';

    const merged: TokenFormValues = { ...data };
    conflict.fields.forEach((field) => {
      const chosen = useOnChain ? field.onChainValue : field.formValue;
      merged[field.key] = chosen;
      form.setValue(field.key, chosen, { shouldValidate: true });
    });

    closeSaveConflict();
    saveEntry(merged, Number(merged.decimals));
  }

  function closeUnverifiedToken() {
    setUnverifiedToken(null);
  }

  function handleContinueUnverified() {
    if (!unverifiedToken) return;
    const data = unverifiedToken;
    closeUnverifiedToken();
    saveEntry(data, Number(data.decimals));
  }

  function handleUseOnChainAutoFill() {
    if (!autoFillConflict) return;
    const { onChainValues } = autoFillConflict;
    form.setValue('name', onChainValues.name, { shouldValidate: true });
    form.setValue('symbol', onChainValues.symbol, { shouldValidate: true });
    form.setValue('decimals', onChainValues.decimals, { shouldValidate: true });
    setAutoFillConflict(null);
  }

  return (
    <>
      <FormLayout
        title={isEdit ? 'Edit token' : 'Add token'}
        onSubmit={form.handleSubmit(handleSubmit)}
        onCancel={onCancel}
        error={error}
        isSaving={form.formState.isSubmitting}
      >
        <InputField
          id="token-name"
          label="Name"
          type="text"
          placeholder="e.g. USD Coin"
          autoFocus={isEdit}
          error={form.formState.errors.name?.message}
          {...form.register('name', { required: 'Name is required' })}
        />

        <AddressField
          id="token-address"
          label="Address"
          autoFocus={!isEdit}
          error={form.formState.errors.address?.message}
          {...form.register('address', { required: 'Address is required' })}
        />

        <div className="grid grid-cols-2 gap-3">
          <InputField
            id="token-symbol"
            label="Symbol"
            type="text"
            placeholder="USDC"
            error={form.formState.errors.symbol?.message}
            {...form.register('symbol', { required: 'Symbol is required' })}
          />
          <InputField
            id="token-decimals"
            label="Decimals"
            type="number"
            min={0}
            placeholder="18"
            error={form.formState.errors.decimals?.message}
            {...form.register('decimals', { required: 'Decimals is required' })}
          />
        </div>

        <Controller
          control={form.control}
          name="chainId"
          rules={{ required: 'Chain is required' }}
          render={({ field, fieldState }) => (
            <ChainField
              id="token-chain"
              label="Chain"
              value={field.value}
              onChange={field.onChange}
              chains={allChains}
              error={fieldState.error?.message}
            />
          )}
        />
      </FormLayout>

      <Dialog open={autoFillConflict !== null} onOpenChange={(open) => !open && setAutoFillConflict(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>On-chain details don&apos;t match</DialogTitle>
            <DialogDescription>
              What&apos;s in the form doesn&apos;t match what this token reports on-chain. Keep the form as is, or
              replace it with the on-chain values.
            </DialogDescription>
          </DialogHeader>

          {autoFillConflict && <FieldConflictTable fields={autoFillConflict.fields} />}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAutoFillConflict(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUseOnChainAutoFill}>
              Use on-chain values
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={saveConflict !== null} onOpenChange={(open) => !open && closeSaveConflict()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>On-chain details don&apos;t match</DialogTitle>
            <DialogDescription>
              What&apos;s in the form doesn&apos;t match what this token reports on-chain. Pick which set of values to
              save.
            </DialogDescription>
          </DialogHeader>

          {saveConflict && (
            <FieldConflictPicker
              fields={saveConflict.conflict.fields}
              selected={selectedConflictSource}
              onSelect={setSelectedConflictSource}
            />
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeSaveConflict}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirmSaveConflict}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={unverifiedToken !== null} onOpenChange={(open) => !open && closeUnverifiedToken()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Could not verify this token</DialogTitle>
            <DialogDescription>
              This address may not be a standard ERC20 token on this chain, or the network could not be reached. Do you
              want to save it anyway?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeUnverifiedToken}>
              Cancel
            </Button>
            <Button type="button" onClick={handleContinueUnverified}>
              Save anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
