import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { cn } from 'cn';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'w-full rounded-lg border border-(--border) bg-(--input-bg) px-3 py-2 text-sm text-(--foreground) transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-(--foreground) placeholder:text-(--muted) focus-visible:ring-2 focus-visible:ring-(--brand)/40 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-(--danger) aria-invalid:focus-visible:ring-(--danger)/40',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
