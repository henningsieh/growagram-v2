"use client";

// src/components/theme-provider.tsx
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-screen bg-zinc-900"></div>; // no light flicker!
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
