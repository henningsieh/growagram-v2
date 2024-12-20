import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// src/lib/utils/index.ts:

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type DateFormatOptions = {
  month?: "long" | "short" | "2-digit";
  weekday?: "long" | "short";
  includeYear?: boolean;
};

export function formatDate<Locale extends string = "en" | "de">(
  date: Date,
  locale: Locale,
  options: DateFormatOptions = {},
): string {
  const { month = "short", weekday, includeYear = true } = options;
  const formatOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    weekday: weekday,
    month: month,
    year: includeYear ? "numeric" : undefined,
  };
  return new Intl.DateTimeFormat(locale, formatOptions).format(date);
}

export function formatTime<Locale extends string = "en" | "de">(
  time: Date,
  locale: Locale,
  options: TimeFormatOptions = {},
): string {
  const { includeSeconds = false, includeMinutes = true } = options;

  // Use Intl.DateTimeFormat to determine whether the locale defaults to a 12-hour or 24-hour format
  const testFormat = new Intl.DateTimeFormat(locale, { hour: "numeric" });
  const inferredHour12 = testFormat.resolvedOptions().hour12 ?? false;

  const formatOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: includeMinutes ? "2-digit" : undefined,
    second: includeSeconds ? "2-digit" : undefined,
    hour12: inferredHour12, // Explicitly use the inferred hour12 setting
  };

  return new Intl.DateTimeFormat(locale, formatOptions).format(time);
}

// Example options interface
interface TimeFormatOptions {
  includeSeconds?: boolean;
  includeMinutes?: boolean;
}
