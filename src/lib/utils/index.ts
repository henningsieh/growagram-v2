// src/lib/utils/index.ts:
import { type ClassValue, clsx } from "clsx";
import TimeAgo from "javascript-time-ago";
import de from "javascript-time-ago/locale/de";
import en from "javascript-time-ago/locale/en";
import { twMerge } from "tailwind-merge";
import { Locale } from "~/types/locale";

TimeAgo.addLocale(en);
TimeAgo.addLocale(de);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type DateFormatOptions = {
  month?: "long" | "short" | "2-digit";
  weekday?: "long" | "short";
  includeYear?: boolean;
  force?: boolean;
};

export function formatDate(
  date: Date,
  locale: Locale,
  options: DateFormatOptions = {},
): string | null {
  const now = new Date();
  const diffInMinutes = (now.getTime() - date.getTime()) / 6000;

  if (diffInMinutes < 1440 && !options.force) {
    return null;
  } else {
    const { month = "short", weekday, includeYear = true } = options;
    const formatOptions: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      weekday: weekday,
      month: month,
      year: includeYear ? "numeric" : undefined,
    };
    return new Intl.DateTimeFormat(locale, formatOptions).format(date);
  }
}

export function formatTime(
  time: Date,
  locale: Locale,
  options: TimeFormatOptions = {},
): string {
  const { includeSeconds = false, includeMinutes = true } = options;
  const now = new Date();
  const diffInMinutes = (now.getTime() - time.getTime()) / 6000;

  const timeAgo = new TimeAgo(locale);
  if (diffInMinutes < 1440) {
    return timeAgo.format(time);
  } else {
    const testFormat = new Intl.DateTimeFormat(locale, { hour: "numeric" });
    const inferredHour12 = testFormat.resolvedOptions().hour12 ?? false;

    const formatOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: includeMinutes ? "2-digit" : undefined,
      second: includeSeconds ? "2-digit" : undefined,
      hour12: inferredHour12,
    };
    const timeString = new Intl.DateTimeFormat(locale, formatOptions).format(
      time,
    );

    // Add localized time words
    return locale === "de" ? `um ${timeString} Uhr` : `at ${timeString}`;
  }
}

// Example options interface
interface TimeFormatOptions {
  includeSeconds?: boolean;
  includeMinutes?: boolean;
}
