'use client';

import { BookUser, X } from 'lucide-react';
import { useState } from 'react';
import { AddressField, InputGroupButton } from '@/components/form/AddressField';
import { AddressPickerDialog, type AddressPickerProps } from './AddressPickerDialog';
import { AddressSelection, type AddressSelectionData } from './AddressSelection';
import type { AddressPickerItem } from './types';

interface Props extends Omit<AddressPickerProps, 'onSelect' | 'title'> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Called with the full entry when picked from the address book (after `onChange`). */
  onPick?: (item: AddressPickerItem) => void;
  /** When set, shown instead of the raw address (logo, name, …). */
  selection?: AddressSelectionData | null | undefined;
  /** The value is a usable address: swap the picker button for a clear (×) button. */
  complete?: boolean;
  pickerTitle?: string;
  placeholder?: string;
  error?: string | undefined;
  hint?: React.ReactNode;
  disabled?: boolean;
  autoFocus?: boolean;
}

/**
 * Address field (paste / type / ENS) with an address-book picker at its right end.
 * Once a value is selected/complete the picker button becomes a clear button.
 */
export function AddressInput({
  value,
  onChange,
  onPick,
  selection,
  complete = false,
  pickerTitle,
  categories,
  strictSelection,
  chainId,
  ...fieldProps
}: Props) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const isSet = !!selection || complete;

  return (
    <>
      <AddressField
        {...fieldProps}
        value={value}
        onChange={(event) => onChange(event.target.value.trim())}
        spellCheck={false}
        autoComplete="off"
        display={selection ? <AddressSelection {...selection} /> : undefined}
        action={
          isSet ? (
            <InputGroupButton onClick={() => onChange('')} disabled={fieldProps.disabled} aria-label="Clear">
              <X size={16} aria-hidden="true" />
            </InputGroupButton>
          ) : (
            <InputGroupButton
              onClick={() => setIsPickerOpen(true)}
              disabled={fieldProps.disabled}
              aria-label="Choose from address book"
            >
              <BookUser size={16} aria-hidden="true" />
            </InputGroupButton>
          )
        }
      />
      <AddressPickerDialog
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        title={pickerTitle}
        categories={categories}
        strictSelection={strictSelection}
        chainId={chainId}
        onSelect={(item) => {
          onChange(item.address);
          onPick?.(item);
        }}
      />
    </>
  );
}
