"use client";

// src/components/navbar/index.tsx:
import Image from "next/image";
import { ThemeToggle } from "~/components/Layouts/MainNavigationBar/theme-toggler";
import { Link } from "~/lib/i18n/routing";

import DesktopNavigationManu from "./Desktop";
import MobileNavigationMenu from "./Mobile";
import { LanguageToggle } from "./language-toggler";

export function MainNavigationBar() {
  return (
    <header className="sticky top-0 z-20 w-full border-b bg-background/90 backdrop-blur">
      <div className="relative flex h-14 items-center justify-center">
        {/* Navigation Left:  Main Logo */}
        <div className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center">
          <Link href={"/"}>
            <Image
              src="/images/grow-a-gram-high-resolution-logo.webp"
              alt="GrowAGram Logo"
              width={86}
              height={50}
              priority
              className="h-12 w-auto" // Make it responsive
            />
          </Link>
        </div>

        {/* Centered: Desktop Navigation */}
        <DesktopNavigationManu />

        {/* Navigation Right Side: Toggles */}
        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center space-x-2">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Language Toggle Button */}
          <LanguageToggle />

          {/* Burger Menu (Mobile Navigation) */}
          <MobileNavigationMenu />
        </div>
      </div>
    </header>
  );
}
