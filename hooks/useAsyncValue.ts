'use client';

import { useCallback, useEffect, useState } from 'react';

export interface AsyncValue<T> {
  value: T | undefined;
  loading: boolean;
  error: unknown;
  /** Re-runs the loader with the current deps. */
  reload: () => void;
}

interface Run {
  id: number;
  deps: React.DependencyList;
}

interface Settled<T> {
  runId: number;
  value: T | undefined;
  error: unknown;
}

const sameDeps = (a: React.DependencyList, b: React.DependencyList) =>
  a.length === b.length && a.every((dep, i) => Object.is(dep, b[i]));

/**
 * Runs `load` whenever `deps` change (or `reload()` is called); stale results are dropped.
 * Pass `null` as `load` to skip (value is undefined, not loading).
 */
export function useAsyncValue<T>(load: (() => Promise<T>) | null, deps: React.DependencyList): AsyncValue<T> {
  const [run, setRun] = useState<Run>({ id: 0, deps });
  const [settled, setSettled] = useState<Settled<T> | null>(null);

  // Start a new run when deps change ("adjusting state while rendering", not in an effect).
  if (!sameDeps(run.deps, deps)) setRun({ id: run.id + 1, deps });

  const enabled = !!load;
  useEffect(() => {
    if (!load) return;
    let cancelled = false;
    load().then(
      (value) => !cancelled && setSettled({ runId: run.id, value, error: null }),
      (error) => !cancelled && setSettled({ runId: run.id, value: undefined, error }),
    );
    return () => {
      cancelled = true;
    };
    // `load` is a fresh closure every render; `run.id` is what identifies a run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.id, enabled]);

  const reload = useCallback(() => setRun((r) => ({ ...r, id: r.id + 1 })), []);
  const current = enabled && settled?.runId === run.id ? settled : null;
  return {
    value: current?.value,
    error: current?.error ?? null,
    loading: enabled && !current,
    reload,
  };
}
