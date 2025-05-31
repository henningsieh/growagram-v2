// src/lib/utils/index.ts:
import { type ClassValue, clsx } from "clsx";
import { formatDistanceToNow as dateFnsFormatDistanceToNow } from "date-fns";
import { de as deLocale } from "date-fns/locale";
import { twMerge } from "tailwind-merge";
import { Locale } from "~/types/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
export function formatDateTime(
  date: Date,
  locale: Locale,
): string {
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
    dateString = `am ${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1)
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
  options: DateFormatOptions = {}
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
  options: TimeFormatOptions = {}
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

// Metadata utilities
export { generatePageMetadata, generateSiteMetadata } from "./metadata";
export type { PageMetadataKey } from "./metadata";


