import * as React from 'react';
import { cn } from 'cn';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'w-full resize-none overflow-hidden rounded-lg border border-(--border) bg-(--input-bg) px-3 py-2 font-mono text-sm break-all text-(--foreground) transition-colors outline-none placeholder:text-(--muted) focus-visible:ring-2 focus-visible:ring-(--brand)/40 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-(--danger) aria-invalid:focus-visible:ring-(--danger)/40',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
