"use client";

// src/components/navbar/index.tsx:
import Image from "next/image";
import DesktopNavigationManu from "~/components/Layouts/MainNavigationBar/Desktop";
import MobileNavigationMenu from "~/components/Layouts/MainNavigationBar/Mobile";
import { LanguageToggle } from "~/components/Layouts/MainNavigationBar/language-toggler";
import { ThemeToggle } from "~/components/Layouts/MainNavigationBar/theme-toggler";
import { ChatButton } from "~/components/features/Chat/chat-button";
import { Notifications } from "~/components/features/Notifications";
import { Link } from "~/lib/i18n/routing";

export function MainNavigationBar() {
  return (
    <header className="bg-background/90 fixed top-0 z-20 w-full border-b backdrop-blur">
      <div className="relative mx-auto flex h-14 items-center justify-center">
        {/* Navigation Left:  Main Logo */}
        <div className="absolute top-0 left-4 flex items-center">
          <Link href={"/"}>
            <Image
              src="/images/GrowAGram_Logo.png"
              alt="GrowAGram Logo"
              width={86}
              height={50}
              priority
              className="h-13 w-auto" // Make it responsive
            />
          </Link>
        </div>

        {/* Centered: Desktop Navigation */}
        <DesktopNavigationManu />

        {/* Navigation Right Side: Toggles */}
        <div className="absolute top-1/2 right-4 flex -translate-y-1/2 items-center space-x-1">
          {/* Chat Button */}
          <ChatButton />

          {/* Notifications Indicator */}
          <Notifications />

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
