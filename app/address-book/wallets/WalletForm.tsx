'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAddressBook } from '@/address-book/AddressBookProvider';
import { WalletAddressSchema, type WalletAddress } from '@/address-book';
import { AddressField } from '@/components/form';
import { InputField } from '@/components/form/InputField';
import { FormLayout } from '@/components/form/FormLayout';
import { resolveAddress } from '@/web3/utils';

interface WalletFormProps {
  entry?: WalletAddress;
  onDone: () => void;
  onCancel: () => void;
}

export default function WalletForm({ entry, onDone, onCancel }: WalletFormProps) {
  const { addWalletAddress, updateWalletAddress } = useAddressBook();
  const [error, setError] = useState<string | null>(null);
  const isEdit = entry !== undefined;

  const form = useForm<WalletAddress>({ defaultValues: entry });

  async function handleSubmit(data: WalletAddress) {
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

    const result = WalletAddressSchema.safeParse({ name: data.name.trim(), address: data.address.trim() });
    if (!result.success) {
      form.setError('address', { type: 'manual', message: result.error.issues[0]?.message ?? 'Invalid input' });
      return;
    }

    try {
      if (isEdit) {
        updateWalletAddress(entry.address, result.data);
      } else {
        addWalletAddress(result.data);
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  return (
    <FormLayout
      title={isEdit ? 'Edit wallet' : 'Add wallet'}
      onSubmit={form.handleSubmit(handleSubmit)}
      onCancel={onCancel}
      error={error}
      isSaving={form.formState.isSubmitting}
    >
      <InputField
        id="wallet-name"
        label="Wallet Name"
        type="text"
        placeholder="e.g. Treasury"
        autoFocus={isEdit}
        error={form.formState.errors.name?.message}
        {...form.register('name', { required: 'Wallet name is required' })}
      />

      <AddressField
        id="wallet-address"
        label="Wallet Address"
        autoFocus={!isEdit}
        error={form.formState.errors.address?.message}
        {...form.register('address', { required: 'Wallet address is required' })}
      />
    </FormLayout>
  );
}
