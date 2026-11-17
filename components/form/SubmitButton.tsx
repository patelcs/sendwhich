import { ButtonHTMLAttributes } from 'react';
import { LoaderCircle } from 'lucide-react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Shows a spinner and disables the button. */
  loading?: boolean;
}

export function SubmitButton({ loading = false, disabled, children, className = '', ...props }: Props) {
  return (
    <button
      type="submit"
      {...props}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`flex items-center justify-center gap-2 rounded-lg border border-(--brand)/30 bg-(--brand)/10 py-2 text-sm font-semibold text-(--brand) transition-colors hover:bg-(--brand)/20 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
