"use client";

// src/components/theme-provider.tsx
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { useEffect, useState } from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // return <>{children}</>;
    // return <>LOADING</>;
    return null; // no flicker!
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
