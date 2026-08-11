'use client';

import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useAddressBook } from '@/address-book/AddressBookProvider';
import { ContractAddressSchema, type ContractAddress } from '@/address-book';
import { InputField } from '@/components/form/InputField';
import { AddressField } from '@/components/form';
import { ChainField } from '@/components/form/ChainField';
import { FormLayout } from '@/components/form/FormLayout';
import { useWallet } from '@/providers/WalletProvider';
import { resolveAddress } from '@/web3/utils';
import { getAllChains } from '@/configs/chain';

interface ContractFormValues {
  name: string;
  address: string;
  chainId: number;
}

interface ContractFormProps {
  entry?: ContractAddress;
  onDone: () => void;
  onCancel: () => void;
}

export default function ContractForm({ entry, onDone, onCancel }: ContractFormProps) {
  const { addContractAddress, updateContractAddress } = useAddressBook();
  const { chainId } = useWallet();
  const [error, setError] = useState<string | null>(null);
  const allChains = useMemo(() => getAllChains().map(({ chain }) => chain), []);
  const isEdit = entry !== undefined;

  const form = useForm<ContractFormValues>({
    defaultValues: {
      name: entry?.name ?? '',
      address: entry?.address ?? '',
      chainId: entry?.chainId ?? chainId,
    },
  });

  async function handleSubmit(data: ContractFormValues) {
    setError(null);

    try {
      await resolveAddress(data.address);
    } catch (err) {
      form.setError('address', {
        type: 'manual',
        message: err instanceof Error ? err.message : 'Invalid address',
      });
      return;
    }

    const result = ContractAddressSchema.safeParse({
      name: data.name.trim(),
      address: data.address.trim(),
      chainId: data.chainId,
    });
    if (!result.success) {
      form.setError('address', { type: 'manual', message: result.error.issues[0]?.message ?? 'Invalid input' });
      return;
    }

    try {
      if (isEdit) {
        updateContractAddress(entry.address, entry.chainId, result.data);
      } else {
        addContractAddress(result.data);
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  return (
    <FormLayout
      title={isEdit ? 'Edit contract' : 'Add contract'}
      onSubmit={form.handleSubmit(handleSubmit)}
      onCancel={onCancel}
      error={error}
      isSaving={form.formState.isSubmitting}
    >
      <InputField
        id="contract-name"
        label="Name"
        type="text"
        placeholder="e.g. Router"
        autoFocus={isEdit}
        error={form.formState.errors.name?.message}
        {...form.register('name', { required: 'Name is required' })}
      />

      <AddressField
        id="contract-address"
        label="Address"
        autoFocus={!isEdit}
        error={form.formState.errors.address?.message}
        {...form.register('address', { required: 'Address is required' })}
      />

      <Controller
        control={form.control}
        name="chainId"
        rules={{ required: 'Chain is required' }}
        render={({ field, fieldState }) => (
          <ChainField
            id="contract-chain"
            label="Chain"
            value={field.value}
            onChange={field.onChange}
            chains={allChains}
            error={fieldState.error?.message}
          />
        )}
      />
    </FormLayout>
  );
}
