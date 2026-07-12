"use client";

import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";
import { createContext, useContext } from "react";

const ThemeContext = createContext({
  theme: "dark",
  toggle: () => { },
});

export const useTheme = () => useContext(ThemeContext);

function ThemeContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme, setTheme } = useNextTheme();

  const toggle = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: resolvedTheme ?? "dark",
        toggle,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ThemeContextProvider>
        {children}
      </ThemeContextProvider>
    </NextThemesProvider>
  );
}