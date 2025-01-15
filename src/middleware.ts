// src/middleware.ts
import { getToken } from "next-auth/jwt";
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import { PROTECTED_PATHS, modulePaths } from "./assets/constants";
import { env } from "./env";
import { routing } from "./lib/i18n/routing";

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

export default async function middleware(req: NextRequest) {
  // Get the current token (user's authentication status)
  const secret = env.AUTH_SECRET;
  const token = await getToken({
    req,
    secret,
    cookieName: env.NEXTAUTH_URL.startsWith("https")
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  });

  const isUsernameUndefined = token && !token.username;

  // Log the full token to verify
  console.debug("Middleware token: ", JSON.stringify(token, null, 2));

  // Get the pathname
  const currentPathname = req.nextUrl.pathname;
  // console.debug("currentPathname: ", currentPathname);

  // Extract the locale from the path. Example: /de/photos or /en/photos
  const localeMatchArray = currentPathname.match(
    new RegExp(`^\/(${languages.join("|")})\/`),
  );

  // Get the real host and protocol
  const realHost = req.headers.get("X-Forwarded-Host") || req.nextUrl.host;
  const protocol = req.headers.get("X-Forwarded-Proto") || req.nextUrl.protocol;
  const baseUrl = env.NEXTAUTH_URL || `${protocol}://${realHost}`;
  const fullUrl = new URL(currentPathname, baseUrl);

  console.debug("realHost:", realHost);
  console.debug("protocol:", protocol);
  console.debug("baseUrl:", baseUrl);
  console.debug("fullUrl:", fullUrl.toString());

  // Handle auth callback paths specially
  if (currentPathname.startsWith("/api/auth/callback")) {
    req.nextUrl.host = realHost;
    req.nextUrl.protocol = new URL(baseUrl).protocol.replace(":", "");
    return NextResponse.rewrite(fullUrl);
  }

  const currentLocale = localeMatchArray ? localeMatchArray[1] : null;

  // Extract the path without locale for comparison
  const pathWithoutLocale = currentLocale
    ? currentPathname.replace(new RegExp(`^/${currentLocale}`), "")
    : currentPathname;

  // Check if the requested path (without locale) exactly matches any protected path
  const isLocalePath = localeMatchArray !== null;
  const isProtectedPath = isLocalePath && isPathProtected(pathWithoutLocale);

  console.debug("isUsernameUndefined: ", isUsernameUndefined);

  // If the path is protected and the user is logged in but has no username, redirect to the account edit page
  if (
    isProtectedPath && // The path is protected
    isUsernameUndefined && // The user is logged in but has no username
    pathWithoutLocale !== modulePaths.ACCOUNT.editPath // The user is not already on the account edit page
  ) {
    const accountRedirectUrl = new URL(
      currentLocale
        ? `/${currentLocale}${modulePaths.ACCOUNT.editPath}`
        : modulePaths.ACCOUNT.editPath,
      baseUrl,
    );
    return NextResponse.redirect(accountRedirectUrl);
  }

  // If the path is protected and the user is not logged in, redirect to the sign-in page
  if (isProtectedPath && !token) {
    console.debug("User is not authenticated. Redirecting to sign-in page.");

    // Redirect using the real URL, preserving the client-facing URL
    const redirectUrl = new URL(modulePaths.SIGNIN.path, baseUrl);
    redirectUrl.searchParams.append("callbackUrl", fullUrl.toString()); // Use the real URL here
    return NextResponse.redirect(redirectUrl); // Redirect to the sign-in page with the real URL
  }

  // Handle the i18n routing for locales and proceed with handling locale routing
  const handleI18nRouting = createMiddleware(routing);
  const i18nResponse = handleI18nRouting(req);
  if (i18nResponse) {
    return i18nResponse; // Ensure locale routing is applied
  }

  const pathnameHasLocale = /^\/[a-zA-Z]{2}(?:\/|$)/.test(currentPathname); // Match any locale (like '/en' or '/de')
  const pathnameHasValidLocale = new RegExp(
    `^\/(?:${languages.join("|")})(?:\/|$)`,
  ).test(currentPathname);

  // If an invalid locale is found, redirect to the home page
  if (pathnameHasLocale && !pathnameHasValidLocale) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Allow the request to proceed if no issues were found
  return NextResponse.next();
}

export const config = {
  // Match all paths to check for invalid locales and routes
  matcher: ["/((?!api|_next|_next/static|_next/image|.*\\..*).*)", "/"],
};
