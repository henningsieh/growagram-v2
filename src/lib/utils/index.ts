// src/lib/utils/index.ts:
import { type ClassValue, clsx } from "clsx";
import { formatDistanceToNow as dateFnsFormatDistanceToNow } from "date-fns";
import type { Locale as DateFnsLocale } from "date-fns";
import { de as deLocale, enUS as enUSLocale } from "date-fns/locale";
import { twMerge } from "tailwind-merge";
import { APP_SETTINGS, GROW_FILTER_EMOJIS } from "~/assets/constants";

/**
 * Grow filter helper functions for emoji and translation key retrieval
 */
import {
  CULTURE_MEDIUM_OPTIONS,
  CultureMedium,
  FERTILIZER_FORM_OPTIONS,
  FERTILIZER_TYPE_OPTIONS,
  FertilizerForm,
  FertilizerType,
  GROW_ENVIRONMENT_OPTIONS,
  GrowEnvironment,
} from "~/types/grow";
import type { Locale } from "~/types/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Maps app locale to date-fns Locale object for internationalization.
 * Only supports locales defined in APP_SETTINGS.LANGUAGES.
 *
 * @param locale - App locale string from APP_SETTINGS.LANGUAGES
 * @returns Corresponding date-fns Locale object
 */
export function getDateFnsLocale(locale?: Locale): DateFnsLocale {
  // Type-safe locale mapping based on APP_SETTINGS.LANGUAGES
  const localeMap: Record<Locale, DateFnsLocale> = {
    de: deLocale,
    en: enUSLocale,
  } as const;

  if (!locale || !(locale in localeMap)) {
    return localeMap[APP_SETTINGS.DEFAULT_LOCALE];
  }

  return localeMap[locale];
}

export type DateFormatOptions = {
  month?: "long" | "short" | "2-digit";
  weekday?: "long" | "short";
  includeYear?: boolean;
  force?: boolean;
};

export interface TimeFormatOptions {
  includeSeconds?: boolean;
  includeMinutes?: boolean;
}

// Centralized date/time formatting for entity info
export function formatDateTime(date: Date, locale: Locale): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = diffInMs / (1000 * 60);
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  // Less than 1 hour: show relative time in minutes
  if (diffInHours < 1) {
    const minutes = Math.floor(diffInMinutes);
    if (locale === "de") {
      return `vor ${minutes === 1 ? "einer" : minutes} Minute${minutes === 1 ? "" : "n"}`;
    }
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  // Less than 24 hours: show relative time in hours
  if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    if (locale === "de") {
      return `vor ${hours === 1 ? "einer" : hours} Std.`;
    }
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  // Less than 10 days: show relative time in days
  if (diffInDays < 10) {
    const days = Math.floor(diffInDays);
    if (locale === "de") {
      return `vor ${days === 1 ? "einem Tag" : days + " Tagen"}.`;
    }
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  // 10 days or older: show absolute date in locale-specific format
  let dateString = "";
  if (locale === "de") {
    // German: dd.mm.yy
    const d = date;
    dateString = `am ${d.getDate().toString().padStart(2, "0")}.${(
      d.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}.${d.getFullYear().toString().slice(-2)}`;
  } else {
    // English: mm/dd/yy
    const d = date;
    dateString = `at ${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}/${d
      .getFullYear()
      .toString()
      .slice(-2)}`;
  }
  return dateString;
}

// Helper functions for formatting absolute date and time (e.g., for ban notifications)
export function formatAbsoluteDate(
  date: Date,
  locale: Locale,
  options: DateFormatOptions = {},
): string {
  if (locale === "de") {
    const intl = new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: options.month === "long" ? "long" : "2-digit",
      year: options.includeYear !== false ? "numeric" : undefined,
    });
    return intl.format(date);
  } else {
    const intl = new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: options.month === "long" ? "long" : "2-digit",
      year: options.includeYear !== false ? "numeric" : undefined,
    });
    return intl.format(date);
  }
}

export function formatAbsoluteTime(
  date: Date,
  locale: Locale,
  options: TimeFormatOptions = {},
): string {
  const intl = new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: options.includeSeconds ? "2-digit" : undefined,
    hour12: locale === "en",
  });
  return intl.format(date);
}

export function formatDistanceToNowLocalized(
  date: Date | string,
  locale: Locale,
  options: { addSuffix?: boolean } = {},
): string {
  const dateObject = date instanceof Date ? date : new Date(date);

  return dateFnsFormatDistanceToNow(dateObject, {
    addSuffix: options.addSuffix ?? true,
    locale: locale === "de" ? deLocale : undefined,
  });
}

export function formatDaysRemaining(
  days: number | null,
  singleDayText: string,
  pluralDaysText: string,
): string | null {
  if (days === null) return null;
  return days === 1 ? `${days} ${singleDayText}` : `${days} ${pluralDaysText}`;
}

/**
 * Calculate the number of weeks between two dates
 */
export function getWeeksBetween(start: Date, end: Date): number {
  const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  return (end.getTime() - start.getTime()) / millisecondsPerWeek;
}

/**
 * Calculate the number of days between two dates
 */
export function getDaysBetween(start: Date, end: Date): number {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((end.getTime() - start.getTime()) / millisecondsPerDay);
}

// Helper functions to get emoji and translation keys from option arrays
export const getGrowEnvironmentEmoji = (
  environment: GrowEnvironment,
): string => {
  return GROW_FILTER_EMOJIS.ENVIRONMENT[environment] || "💡";
};

export const getGrowEnvironmentTranslationKey = (
  environment: GrowEnvironment,
): string => {
  return (
    GROW_ENVIRONMENT_OPTIONS.find((option) => option.value === environment)
      ?.translationKey || "environment-indoor"
  );
};

export const getCultureMediumEmoji = (medium: CultureMedium): string => {
  return GROW_FILTER_EMOJIS.CULTURE_MEDIUM[medium] || "🌱";
};

export const getCultureMediumTranslationKey = (
  medium: CultureMedium,
): string => {
  return (
    CULTURE_MEDIUM_OPTIONS.find((option) => option.value === medium)
      ?.translationKey || "culture-medium-soil"
  );
};

export const getFertilizerTypeEmoji = (type: FertilizerType): string => {
  return GROW_FILTER_EMOJIS.FERTILIZER_TYPE[type] || "🌿";
};

export const getFertilizerTypeTranslationKey = (
  type: FertilizerType,
): string => {
  return (
    FERTILIZER_TYPE_OPTIONS.find((option) => option.value === type)
      ?.translationKey || "fertilizer-type-organic"
  );
};

export const getFertilizerFormEmoji = (form: FertilizerForm): string => {
  return GROW_FILTER_EMOJIS.FERTILIZER_FORM[form] || "💧";
};

export const getFertilizerFormTranslationKey = (
  form: FertilizerForm,
): string => {
  return (
    FERTILIZER_FORM_OPTIONS.find((option) => option.value === form)
      ?.translationKey || "fertilizer-type-liquid"
  );
};

// // Utility functions to get all emojis for filter categories
// export function getAllEnvironmentEmojis(): string {
//   return Object.values(GROW_FILTER_EMOJIS.ENVIRONMENT).join(" ");
// }

// export function getAllCultureMediumEmojis(): string {
//   return Object.values(GROW_FILTER_EMOJIS.CULTURE_MEDIUM).join(" ");
// }

// export function getAllFertilizerTypeEmojis(): string {
//   return Object.values(GROW_FILTER_EMOJIS.FERTILIZER_TYPE).join(" ");
// }

// export function getAllFertilizerFormEmojis(): string {
//   return Object.values(GROW_FILTER_EMOJIS.FERTILIZER_FORM).join(" ");
// }

// Metadata utilities
export { generatePageMetadata, generateSiteMetadata } from "./metadata";
export type { PageMetadataKey } from "./metadata";

/**
 * User ban status utility functions
 */

/**
 * Checks if a user is currently banned.
 * A user is banned if:
 * - bannedUntil is null (permanent ban), OR
 * - bannedUntil is a future date (temporary ban)
 *
 * @param user - User object with bannedUntil and banReason properties
 * @returns true if the user is currently banned, false otherwise
 */
export function isUserBanned(
  user:
    | { bannedUntil?: Date | string | null; banReason?: string | null }
    | null
    | undefined,
): boolean {
  if (!user) return false;

  // Check for permanent ban: bannedUntil is null AND banReason exists
  if (user.bannedUntil === null && user.banReason) {
    return true;
  }

  // Check for temporary ban: bannedUntil is a future date
  if (user.bannedUntil) {
    const bannedUntil = new Date(user.bannedUntil);
    return bannedUntil > new Date();
  }

  return false;
}

/**
 * Checks if a user has a permanent ban.
 * A permanent ban is indicated by bannedUntil being null AND banReason existing.
 *
 * @param user - User object with bannedUntil and banReason properties
 * @returns true if the user has a permanent ban, false otherwise
 */
export function isPermanentBan(
  user:
    | { bannedUntil?: Date | string | null; banReason?: string | null }
    | null
    | undefined,
): boolean {
  if (!user) return false;
  return user.bannedUntil === null && Boolean(user.banReason);
}

/**
 * Gets the ban expiration date for a temporarily banned user.
 * Returns null for permanent bans or non-banned users.
 *
 * @param user - User object with bannedUntil property
 * @returns Date object for ban expiration, or null if permanent ban or not banned
 */
export function getBanExpirationDate(
  user:
    | { bannedUntil?: Date | string | null; banReason?: string | null }
    | null
    | undefined,
): Date | null {
  if (!user || isPermanentBan(user) || !user.bannedUntil) return null;

  const bannedUntil = new Date(user.bannedUntil);
  return bannedUntil > new Date() ? bannedUntil : null;
}
