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

export function calculateGrowthProgress(
  plantedDate: Date,
  flowingStaredDate?: Date | null,
): number {
  const now = new Date();
  const totalVegetativeWeeks = 5; // Typical vegetative phase duration
  const totalFloweringWeeks = 10; // Typical flowering phase duration
  const totalGrowthWeeks = totalVegetativeWeeks + totalFloweringWeeks; // Total growth duration

  // Helper function to calculate the difference in weeks between two dates
  const getWeeksBetween = (start: Date, end: Date) => {
    const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    return (end.getTime() - start.getTime()) / millisecondsPerWeek;
  };

  // If flowering start date is provided, calculate progress based on the flowering phase
  if (flowingStaredDate) {
    const weeksFromPlantedToFlowering = getWeeksBetween(
      plantedDate,
      flowingStaredDate,
    );
    const weeksFromFloweringStarted = getWeeksBetween(flowingStaredDate, now);

    if (weeksFromFloweringStarted >= 0) {
      // We are in the flowering phase or later
      const totalWeeksPassed =
        weeksFromPlantedToFlowering + weeksFromFloweringStarted;
      const overallProgress = (totalWeeksPassed / totalGrowthWeeks) * 100;
      return Math.min(Math.max(Math.round(overallProgress), 0), 100);
    } else {
      // Still in the vegetative phase
      const progressDuringVegetative =
        (weeksFromPlantedToFlowering / totalVegetativeWeeks) * 100;
      return Math.min(Math.max(Math.round(progressDuringVegetative), 0), 100);
    }
  } else {
    // If only planted date is provided, estimate progress in the full 15-week cycle
    const weeksFromPlanted = getWeeksBetween(plantedDate, now);
    const overallProgress = (weeksFromPlanted / totalGrowthWeeks) * 100;
    return Math.min(Math.max(Math.round(overallProgress), 0), 100);
  }
}
