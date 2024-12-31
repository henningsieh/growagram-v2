"use client";

// src/components/theme-provider.tsx
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, useState } from "react";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-screen bg-zinc-900"></div>; // no light flicker!
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
