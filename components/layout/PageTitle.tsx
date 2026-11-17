'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type SetTitle = (update: (current: string | undefined) => string | undefined) => void;

const TitleContext = createContext<string | undefined>(undefined);
const SetTitleContext = createContext<SetTitle | null>(null);

/** Holds the current page's title so the navbar can show it. */
export function PageTitleProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState<string>();
  return (
    <SetTitleContext.Provider value={setTitle}>
      <TitleContext.Provider value={title}>{children}</TitleContext.Provider>
    </SetTitleContext.Provider>
  );
}

/** The title set by the current page, if any. */
export function usePageTitleValue(): string | undefined {
  return useContext(TitleContext);
}

/** Shows `title` in the navbar while the calling component is mounted. */
export function usePageTitle(title: string) {
  const setTitle = useContext(SetTitleContext);
  useEffect(() => {
    if (!setTitle) return;
    setTitle(() => title);
    // Only clear our own title, in case the next page already set its one.
    return () => setTitle((current) => (current === title ? undefined : current));
  }, [setTitle, title]);
}

/** `usePageTitle` for server-component pages. */
export function PageTitle({ title }: { title: string }) {
  usePageTitle(title);
  return null;
}
