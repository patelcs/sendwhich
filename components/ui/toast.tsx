'use client';

import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

export type ToastVariant = 'info' | 'success' | 'error';

export interface ToastOptions {
  title: string;
  description?: string | undefined;
  variant?: ToastVariant;
  action?: { label: string; href: string };
  /** ms before auto-dismiss; errors stay a little longer by default. */
  duration?: number;
}

interface Toast extends ToastOptions {
  id: number;
}

const ToastContext = createContext<((options: ToastOptions) => void) | null>(null);

export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error('useToast must be used within ToastProvider');
  return toast;
}

const VARIANTS: Record<ToastVariant, { Icon: typeof Info; className: string }> = {
  info: { Icon: Info, className: 'text-(--brand)' },
  success: { Icon: CircleCheck, className: 'text-(--success)' },
  error: { Icon: CircleAlert, className: 'text-(--danger)' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = nextId.current++;
      setToasts((list) => [...list, { ...options, id }]);
      setTimeout(() => dismiss(id), options.duration ?? (options.variant === 'error' ? 8000 : 5000));
    },
    [dismiss],
  );

  const value = useMemo(() => toast, [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-60 flex flex-col items-center gap-2 px-4 md:inset-x-auto md:right-6 md:bottom-6 md:items-end"
      >
        {toasts.map(({ id, title, description, variant = 'info', action }) => {
          const { Icon, className } = VARIANTS[variant];
          return (
            <div
              key={id}
              role={variant === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto flex w-full max-w-sm animate-in items-start gap-3 rounded-xl border border-(--border) bg-(--card) px-3 py-3.5 text-sm shadow-2xl fade-in-0 slide-in-from-bottom-2"
            >
              <Icon size={18} className={`mt-0.5 shrink-0 ${className}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-base font-medium text-(--foreground)">{title}</p>
                {description && <p className="mt-0.5 break-words text-(--muted)">{description}</p>}
                {action && (
                  <a
                    href={action.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block font-medium text-(--brand) hover:underline"
                  >
                    {action.label}
                  </a>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(id)}
                aria-label="Dismiss"
                className="shrink-0 text-(--muted) transition-colors hover:text-(--foreground)"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
