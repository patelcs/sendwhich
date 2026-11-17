import React, { FormHTMLAttributes } from 'react';
import { SubmitButton } from './SubmitButton';

interface Props extends FormHTMLAttributes<HTMLFormElement> {
  title: string;
  children: React.ReactNode;
  error?: string | null;
  onCancel: () => void;
  isSaving?: boolean;
}

export function FormLayout({ isSaving, ...props }: Props) {
  return (
    <div className="-m-1 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-1">
      <h1 className="text-lg font-bold text-(--foreground)">{props.title}</h1>

      <form {...props} className={`flex flex-col gap-4 ${props.className}`}>
        {props.children}

        {props.error && <p className="text-xs text-(--danger)">{props.error}</p>}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={props.onCancel}
            className="flex-1 rounded-lg border border-(--border) py-2 text-sm font-semibold text-(--foreground) transition-colors hover:bg-(--accent) sm:flex-none sm:px-6"
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
