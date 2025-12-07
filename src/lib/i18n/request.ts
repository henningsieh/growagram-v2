import { getRequestConfig } from "next-intl/server";

import { routing } from "~/lib/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as never)) {
    locale = routing.defaultLocale;
  }

  interface Messages {
    default: Record<string, never>;
  }

  return {
    locale,
    messages: ((await import(`./messages/${locale}.json`)) as Messages).default,
  };
});
