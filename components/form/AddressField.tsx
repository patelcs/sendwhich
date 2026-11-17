'use client';

import { TextareaHTMLAttributes, useLayoutEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  error?: string | undefined;
  /** Neutral helper line under the field (hidden while there's an error). */
  hint?: React.ReactNode;
  /** Right-end segment of the field (use `InputGroupButton`). */
  action?: React.ReactNode;
  /** Shown instead of the text area, e.g. the selected entry. */
  display?: React.ReactNode;
  /** Right side of the label row (e.g. balance). */
  labelExtra?: React.ReactNode;
  ref?: React.Ref<HTMLTextAreaElement>;
}

/** Address text area inside a rounded input group, with an optional right-end action. */
export function AddressField({
  label,
  error,
  hint,
  action,
  display,
  labelExtra,
  onChange,
  ref,
  className = '',
  ...props
}: Props) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);

  function resize() {
    const el = innerRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  // Also covers values set programmatically (e.g. picked from the address book).
  useLayoutEffect(resize, [props.value, display]);

  function setRef(el: HTMLTextAreaElement | null) {
    innerRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={props.id}>{label}</Label>
        {labelExtra}
      </div>
      <div
        aria-invalid={!!error}
        className="flex min-h-14 items-stretch overflow-hidden rounded-lg border border-(--border) bg-(--input-bg) transition-colors focus-within:ring-2 focus-within:ring-(--brand)/40 aria-invalid:border-(--danger) aria-invalid:focus-within:ring-(--danger)/40 has-disabled:opacity-60"
      >
        <div className="flex min-w-0 flex-1 items-center">
          {display ?? (
            <textarea
              placeholder="0x.. or vitalik.eth"
              {...props}
              ref={setRef}
              rows={1}
              onChange={(e) => {
                resize();
                onChange?.(e);
              }}
              aria-invalid={!!error}
              // 16px like other inputs; long addresses wrap and the field grows (see `resize`).
              className={`block w-full resize-none overflow-hidden bg-transparent px-3 py-2 text-base break-all text-(--foreground) outline-none placeholder:text-(--muted) disabled:cursor-not-allowed ${className}`}
            />
          )}
        </div>
        {action && <div className="flex shrink-0 border-l border-(--border)">{action}</div>}
      </div>
      {error ? (
        <p className="text-sm text-(--danger)">{error}</p>
      ) : (
        hint && <div className="text-sm text-(--muted)">{hint}</div>
      )}
    </div>
  );
}

/** Full-height button for an input group's right-end segment. */
export function InputGroupButton({ className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`flex w-11 items-center justify-center text-(--muted) transition-colors hover:bg-(--accent) hover:text-(--foreground) disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  );
}
