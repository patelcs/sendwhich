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
      className={`flex h-12 items-center justify-center gap-2 rounded-xl border border-(--brand-foreground)/10 bg-linear-to-b from-(--brand) to-(--brand-strong) text-base font-semibold text-(--brand-foreground) shadow-lg shadow-(--brand)/30 transition-[filter,box-shadow,transform] hover:brightness-110 hover:shadow-(--brand)/45 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:brightness-100 ${className}`}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
