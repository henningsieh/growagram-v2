"use client";

// src/app/not-found.tsx
import { usePathname } from "next/navigation";
import { routing } from "~/lib/i18n/routing";

export default function NotFound() {
  const pathname = usePathname();

  // Extract locale from pathname if it exists
  const localeMatch = pathname?.match(
    new RegExp(`^/(${routing.locales.join("|")})/`),
  );
  const currentLocale = localeMatch ? localeMatch[1] : routing.defaultLocale;

  // Basic translations for the 404 page
  const translations: Record<string, { title: string; message: string }> = {
    en: {
      title: "404 - Page Not Found",
      message: "The page you're looking for doesn't exist.",
    },
    de: {
      title: "404 - Seite nicht gefunden",
      message: "Die gesuchte Seite existiert nicht.",
    },
    // Add other languages as needed
  };

  const { title, message } =
    translations[currentLocale] || translations[routing.defaultLocale];

  return (
    <html lang={currentLocale}>
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            fontFamily: "system-ui, -apple-system, sans-serif",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <h2>{title}</h2>
          <h3>Path: {pathname}</h3>
          <p>{message}</p>
        </div>
      </body>
    </html>
  );
}
