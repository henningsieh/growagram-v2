import { Metadata } from "next";

import { getTranslations } from "next-intl/server";

export type PageMetadataKey =
  | "explore"
  | "timeline"
  | "plants"
  | "grows"
  | "following"
  | "dashboard";

/**
 * Generates localized metadata for pages using next-intl translations
 * @param page - The page key from the metadata translations
 * @param locale - The locale (required for proper internationalization)
 * @returns Promise<Metadata> - Next.js metadata object
 */
export async function generatePageMetadata(
  page: PageMetadataKey,
  locale: string,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t(`pages.${page}.title`),
    description: t(`pages.${page}.description`),
    keywords: t(`pages.${page}.keywords`),
    openGraph: {
      title: t(`pages.${page}.title`),
      description: t(`pages.${page}.description`),
      type: "website",
      locale: locale || "en",
      siteName: t("site.title"),
    },
    twitter: {
      card: "summary_large_image",
      title: t(`pages.${page}.title`),
      description: t(`pages.${page}.description`),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/**
 * Generates site-wide metadata using next-intl translations
 * @param locale - The locale (required for proper internationalization)
 * @returns Promise<Metadata> - Next.js metadata object
 */
export async function generateSiteMetadata(locale: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: {
      default: t("site.title"),
      template: `%s | ${t("site.title")}`,
    },
    description: t("site.description"),
    keywords: t("site.keywords"),
    openGraph: {
      title: t("site.title"),
      description: t("site.description"),
      type: "website",
      locale: locale || "en",
      siteName: t("site.title"),
    },
    twitter: {
      card: "summary_large_image",
      title: t("site.title"),
      description: t("site.description"),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}
