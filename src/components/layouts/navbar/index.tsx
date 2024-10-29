"use client";

// src/components/navbar/index.tsx:
import Image from "next/image";
import { ThemeToggle } from "~/components/layouts/navbar/theme-toggler";
import { Link } from "~/lib/i18n/routing";

import DesktopNavigationManu from "./desktop-nav";
import { LanguageToggle } from "./language-toggler";
import MobileNavigationMenu from "./mobile-nav";

export function MainNavigationBar() {
  return (
    <>
      {/* Navigation Left:  Main Logo */}
      <div className="absolute left-4 top-1/2 flex -translate-y-1/2 items-center">
        <Link href={"/"}>
          <Image
            src="/images/grow-a-gram-high-resolution-logo.webp" // Remove "public" from path
            alt="GrowAGram Logo"
            width={86} // Add appropriate width
            height={50} // Add appropriate height
            priority // Add priority for above-the-fold image
            className="h-12 w-auto" // Make it responsive
          />
        </Link>
      </div>

      {/* Centered: Desktop Navigation */}
      <DesktopNavigationManu />

      {/* Navigation Right Side:  Toggles */}
      <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center space-x-2">
        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Language Toggle Button */}
        <LanguageToggle />

        {/* Burger Menu (Mobile Navigation) */}
        <MobileNavigationMenu />
      </div>
    </>
  );
}
