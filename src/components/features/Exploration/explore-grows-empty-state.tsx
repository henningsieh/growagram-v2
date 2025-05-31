"use client";

import { useTranslations } from "next-intl";

export function ExploreGrowsEmptyState() {
  const t = useTranslations("Exploration.Grows");

  return (
    <div className="py-12 text-center">
      <div className="mx-auto max-w-md">
        <div className="bg-muted/50 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <svg
            className="text-muted-foreground h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h3 className="mb-2 text-lg font-medium">
          {t("no-grows-found", { defaultValue: "No grows found" })}
        </h3>

        <p className="text-muted-foreground mb-4 text-sm">
          {t("try-different-filters", {
            defaultValue: "Try adjusting your filters to find more grows.",
          })}
        </p>
      </div>
    </div>
  );
}
