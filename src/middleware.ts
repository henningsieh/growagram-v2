import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { routing } from "./lib/i18n/routing";

// Create a custom middleware handler
export async function middleware(request: NextRequest) {
  const handleI18nRouting = createMiddleware(routing);

  // Get the pathname from the request
  const pathname = request.nextUrl.pathname;

  // Check if the path starts with a locale that's not 'de' or 'en'
  const pathnameHasLocale = /^\/[a-zA-Z]{2}(?:\/|$)/.test(pathname);
  const pathnameHasValidLocale = /^\/(?:de|en)(?:\/|$)/.test(pathname);

  if (pathnameHasLocale && !pathnameHasValidLocale) {
    // Redirect to home page if an invalid locale is found
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }

  // Handle regular i18n routing for valid paths
  return handleI18nRouting(request);
}

export const config = {
  // Match all paths to check for invalid locales
  matcher: ["/((?!api|_next|.*\\..*).*)", "/"],
};
