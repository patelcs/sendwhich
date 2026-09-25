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
    value.then((resolved) => {
      if (!cancelled) setText(resolved);
    });
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
