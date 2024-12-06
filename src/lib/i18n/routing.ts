// src/lib/i18n/routing.ts:
import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
import { APP_SETTINGS } from "~/assets/constants";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: APP_SETTINGS.LANGUAGES.map((lang) => lang.code), // ["de", "en"],

  // Used when no locale matches
  defaultLocale: APP_SETTINGS.DEFAULT_LOCALE,
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
