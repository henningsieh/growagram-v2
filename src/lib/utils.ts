import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type DateFormatOptions = {
  month?: "long" | "short" | "2-digit";
  weekday?: "long" | "short";
  includeYear?: boolean;
};

export function formatDate<Locale extends string = "en" | "de">(
  date: Date,
  locale: Locale,
  options: DateFormatOptions,
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
