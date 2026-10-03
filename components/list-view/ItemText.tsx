'use client';

import { useEffect, useState } from 'react';

interface Props {
  value: string | Promise<string>;
  skeletonWidthClassName?: string;
}

export function ItemText({ value, skeletonWidthClassName = 'w-24' }: Props): React.ReactNode {
  const [text, setText] = useState<string | null>(() => (value instanceof Promise ? null : value));

  useEffect(() => {
    if (!(value instanceof Promise)) {
      setText(value);
      return;
    }

    let cancelled = false;
    setText(null);
    value.then(
      (resolved) => {
        if (!cancelled) setText(resolved);
      },
      (error) => {
        // Callers should resolve to their own error text; this only stops an endless skeleton.
        console.error('[ItemText] value promise rejected:', error);
        if (!cancelled) setText('Error');
      },
    );
    return () => {
      cancelled = true;
    };
  }, [value]);

  if (text === null) {
    return (
      <span
        className={`inline-block h-[1em] animate-pulse rounded-sm bg-(--accent) align-middle ${skeletonWidthClassName}`}
      />
    );
  }

  return <>{text}</>;
}
