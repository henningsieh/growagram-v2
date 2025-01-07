// src/middleware.ts
import { getToken } from "next-auth/jwt";
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import { PROTECTED_PATHS, modulePaths } from "./assets/constants";
import { env } from "./env";
import { auth } from "./lib/auth";
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
  const session = await auth();
  console.debug("Middleware session: ", JSON.stringify(session, null, 2));

  const secret = env.AUTH_SECRET;
  console.debug("secret: ", secret);

  // Get the current token (user's authentication status)
  const token = await getToken({
    req,
    secret,
    ...(process.env.NODE_ENV === "production"
      ? {
          cookieName: "__Secure-authjs.session-token",
        }
      : {}),
  });

  // Log the full token to verify
  console.debug("Middleware token: ", JSON.stringify(token, null, 2));

  // Get the pathname
  const currentPathname = req.nextUrl.pathname;
  console.debug("currentPathname: ", currentPathname);

  // Extract the locale from the path. Example: /de/photos or /en/photos
  const localeMatchArray = currentPathname.match(
    new RegExp(`^\/(${languages.join("|")})\/`),
  );

  // Get the real host from the 'X-Forwarded-Host' header or fallback to the request's host
  const realHost = req.headers.get("X-Forwarded-Host") || req.nextUrl.host;
  console.debug(realHost);
  console.debug(req.nextUrl.host);
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
  if (isProtectedPath && !token) {
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
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Proceed with handling locale routing
  const i18nResponse = handleI18nRouting(req);
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
