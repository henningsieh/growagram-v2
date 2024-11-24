// src/app/[locale]/not-found.tsx
import { headers } from "next/headers";
import { routing } from "~/lib/i18n/routing";

export default async function LocalizedNotFound() {
  // Get pathname from headers (server-side)
  // Get pathname from headers (server-side)
  const pathname = (await headers()).get("x-invoke-path") || "";

  // Extract locale from pathname
  const localeMatch = pathname?.match(
    new RegExp(`^/(${routing.locales.join("|")})/`),
  );
  const currentLocale = localeMatch ? localeMatch[1] : routing.defaultLocale;

  const translations: Record<string, { title: string; message: string }> = {
    en: {
      title: "404 - Page Not Found",
      message: "The page you're looking for doesn't exist.",
    },
    de: {
      title: "404 - Seite nicht gefunden",
      message: "Die gesuchte Seite existiert nicht.",
    },
  };

  const { title, message } =
    translations[currentLocale] || translations[routing.defaultLocale];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-5 text-center font-sans">
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      <h3 className="mb-2 text-gray-600">Path: {pathname}</h3>
      <p>{message}</p>
    </div>
  );
}
