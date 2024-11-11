import NextAuth from "next-auth";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import authConfig from "~/lib/auth/auth.config";

import { routing } from "./lib/i18n/routing";

// Initialize NextAuth's middleware (edge-compatible)
const { auth } = NextAuth(authConfig);

const languages = routing.locales;

export default async function middleware(request: NextRequest) {
  // Get the current session (user's authentication status)
  const session = await auth();
  console.debug("Session:", session); // Debugging session

  // Extract the locale from the path. Example: /de/images or /en/images
  const localeMatch = request.nextUrl.pathname.match(
    new RegExp(`^\/(${languages.join("|")})\/`),
  );

  const isLocalePath = localeMatch !== null;

  // Check if the requested path is a localized protected path (like /en/images or /de/images)
  const isProtectedPath =
    isLocalePath && request.nextUrl.pathname.includes("/images");

  // If the path is protected and the user is not logged in, redirect to the sign-in page
  if (isProtectedPath && !session?.user) {
    console.debug("User is not authenticated. Redirecting to sign-in page.");

    // Redirect to sign-in page and append the current URL as the callback URL
    const redirectUrl = new URL("/api/auth/signin", request.url);
    redirectUrl.searchParams.append("callbackUrl", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Handle the i18n routing for locales
  const handleI18nRouting = createMiddleware(routing);

  const pathname = request.nextUrl.pathname;
  const pathnameHasLocale = /^\/[a-zA-Z]{2}(?:\/|$)/.test(pathname); // Match any locale (like '/en' or '/de')
  const pathnameHasValidLocale = new RegExp(
    `^\/(?:${languages.join("|")})(?:\/|$)`,
  ).test(pathname);

  // If an invalid locale is found, redirect to the home page
  if (pathnameHasLocale && !pathnameHasValidLocale) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Proceed with handling locale routing
  const i18nResponse = handleI18nRouting(request);
  if (i18nResponse) {
    return i18nResponse; // Ensure locale routing is applied
  }

  // Allow the request to proceed if no issues were found
  return NextResponse.next();
}

export const config = {
  // Match all paths to check for invalid locales and routes
  matcher: ["/((?!api|_next|_next/static|_next/image|.*\\..*).*)", "/"],
};
