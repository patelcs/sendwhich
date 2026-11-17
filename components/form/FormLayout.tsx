import React, { FormHTMLAttributes } from 'react';
import { usePageTitle } from '@/components/layout/PageTitle';
import { SubmitButton } from './SubmitButton';

interface Props extends FormHTMLAttributes<HTMLFormElement> {
  title: string;
  children: React.ReactNode;
  error?: string | null;
  onCancel: () => void;
  isSaving?: boolean;
}

export function FormLayout({ isSaving, title, ...props }: Props) {
  usePageTitle(title);
  return (
    <div className="-m-1 flex min-h-0 w-full max-w-lg flex-1 flex-col gap-5 overflow-y-auto p-1">
      <form {...props} className={`flex flex-col gap-4 ${props.className}`}>
        {props.children}

        {props.error && <p className="text-sm text-(--danger)">{props.error}</p>}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={props.onCancel}
            className="flex h-12 flex-1 items-center justify-center rounded-lg border border-(--border) text-base font-semibold text-(--foreground) transition-colors hover:bg-(--accent) sm:flex-none sm:px-6"
          >
            Cancel
          </button>
          <SubmitButton loading={isSaving} className="flex-1 sm:flex-none sm:px-6">
            Save
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
