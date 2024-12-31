// src/middleware.ts
import NextAuth from "next-auth";
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import authConfig from "~/lib/auth/auth.config";

import { PROTECTED_PATHS, modulePaths } from "./assets/constants";
import { routing } from "./lib/i18n/routing";

// Initialize NextAuth's middleware (edge-compatible)
const { auth } = NextAuth(authConfig);

const languages = routing.locales;

// Helper function to check if a path should be protected
function isPathProtected(path: string): boolean {
  return PROTECTED_PATHS.some(
    (protectedPath) =>
      path === `${protectedPath}` || // Exact match
      path === `${protectedPath}/` || // Trailing slash
      path.startsWith(`${protectedPath}/`), // Any subpath
  );
}

export default async function middleware(request: NextRequest) {
  // Get the current session (user's authentication status)
  const session = await auth();
  // Log the full session to verify
  console.debug("Middleware session: ", JSON.stringify(session, null, 2));

  // Get the pathname
  const currentPathname = request.nextUrl.pathname;
  console.debug("currentPathname: ", currentPathname);

  // Extract the locale from the path. Example: /de/photos or /en/photos
  const localeMatchArray = currentPathname.match(
    new RegExp(`^\/(${languages.join("|")})\/`),
  );

  // Get the real host from the 'X-Forwarded-Host' header or fallback to the request's host
  const realHost =
    request.headers.get("X-Forwarded-Host") || request.nextUrl.host;
  console.debug(realHost);
  console.debug(request.nextUrl.host);
  // This will be the actual URL seen in the browser
  const browserUrl = `http://${realHost}${currentPathname}`;
  console.debug("browserUrl: ", browserUrl); // Logs the real URL seen by the user

  const currentLocale = localeMatchArray ? localeMatchArray[1] : null;

  console.debug("currentLocale: ", currentLocale);

  // Extract the path without locale for comparison
  const pathWithoutLocale = currentLocale
    ? currentPathname.replace(new RegExp(`^/${currentLocale}`), "")
    : currentPathname;

  // Check if the requested path (without locale) exactly matches any protected path
  const isLocalePath = localeMatchArray !== null;
  const isProtectedPath = isLocalePath && isPathProtected(pathWithoutLocale);

  // If the path is protected and the user is not logged in, redirect to the sign-in page
  if (isProtectedPath && !session?.user) {
    console.debug("User is not authenticated. Redirecting to sign-in page.");

    // Redirect using the real URL, preserving the client-facing URL
    const redirectUrl = new URL(modulePaths.SIGNIN.path, `http://${realHost}`); //TODO: should be in sync with env next-auth url!
    redirectUrl.searchParams.append("callbackUrl", browserUrl); // Use the real URL here
    return NextResponse.redirect(redirectUrl); // Redirect to the sign-in page with the real URL
  }

  // Handle the i18n routing for locales
  const handleI18nRouting = createMiddleware(routing);

  const pathnameHasLocale = /^\/[a-zA-Z]{2}(?:\/|$)/.test(currentPathname); // Match any locale (like '/en' or '/de')
  const pathnameHasValidLocale = new RegExp(
    `^\/(?:${languages.join("|")})(?:\/|$)`,
  ).test(currentPathname);

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
