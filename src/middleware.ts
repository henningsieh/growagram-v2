import NextAuth from "next-auth";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import authConfig from "~/lib/auth/auth.config";

import { routing } from "./lib/i18n/routing";

// Initialize NextAuth's middleware (edge-compatible)
const { auth } = NextAuth(authConfig);

const languages = routing.locales;

// Define base protected paths
const PROTECTED_PATHS = [
  "/dashboard",
  "/grows",
  "/plants",
  "/images",
  "/inventory",
];

// Helper function to check if a path should be protected
function isPathProtected(path: string): boolean {
  return PROTECTED_PATHS.some(
    (protectedPath) =>
      path === protectedPath || // Exact match
      path === `${protectedPath}/` || // Trailing slash
      path.startsWith(`${protectedPath}/`), // Any subpath
  );
}

export default async function middleware(request: NextRequest) {
  // Get the current session (user's authentication status)
  const session = await auth();
  // console.debug("Session:", session); // Debugging session

  // Get the pathname
  const pathname = request.nextUrl.pathname;

  // Extract the locale from the path. Example: /de/images or /en/images
  const localeMatch = request.nextUrl.pathname.match(
    new RegExp(`^\/(${languages.join("|")})\/`),
  );

  // Get the real host from the 'X-Forwarded-Host' header or fallback to the request's host
  const realHost =
    request.headers.get("X-Forwarded-Host") || request.nextUrl.host;

  // This will be the actual URL seen in the browser
  const realUrl = `http://${realHost}${request.nextUrl.pathname}`;
  console.debug("Real requested URL (client's perspective): ", realUrl); // Logs the real URL seen by the user

  const currentLocale = localeMatch ? localeMatch[1] : null;

  console.debug("currentLocale: ", currentLocale);

  // Extract the path without locale for comparison
  const pathWithoutLocale = currentLocale
    ? pathname.replace(new RegExp(`^/${currentLocale}`), "")
    : pathname;

  // Check if the requested path (without locale) exactly matches any protected path
  const isLocalePath = localeMatch !== null;
  const isProtectedPath = isLocalePath && isPathProtected(pathWithoutLocale);

  // If the path is protected and the user is not logged in, redirect to the sign-in page
  if (isProtectedPath && !session?.user) {
    console.debug("User is not authenticated. Redirecting to sign-in page.");

    // Redirect using the real URL, preserving the client-facing URL
    const redirectUrl = new URL(
      // `/${currentLocale}/login`,
      `/api/auth/signin`,
      `http://${realHost}`,
    );
    redirectUrl.searchParams.append("callbackUrl", realUrl); // Use the real URL here
    return NextResponse.redirect(redirectUrl); // Redirect to the sign-in page with the real URL
  }

  // Handle the i18n routing for locales
  const handleI18nRouting = createMiddleware(routing);

  // const pathname = request.nextUrl.pathname;
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
