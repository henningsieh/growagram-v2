"use client";

import React from "react";

import { useTranslations } from "next-intl";

import { Search, User, X } from "lucide-react";

import { Badge } from "~/components/ui/badge";

import {
  CultureMedium,
  FertilizerForm,
  FertilizerType,
  GrowEnvironment,
} from "~/types/grow";

import {
  getCultureMediumEmoji,
  getCultureMediumTranslationKey,
  getFertilizerFormEmoji,
  getFertilizerFormTranslationKey,
  getFertilizerTypeEmoji,
  getFertilizerTypeTranslationKey,
  getGrowEnvironmentEmoji,
  getGrowEnvironmentTranslationKey,
} from "~/lib/utils";

interface ActiveFiltersBadgesProps {
  filters: {
    search: string;
    username: string;
    environment: string | null;
    cultureMedium: string | null;
    fertilizerType: string | null;
    fertilizerForm: string | null;
  };
  onClearFilters: {
    search: () => void;
    username: () => void;
    environment: () => void;
    cultureMedium: () => void;
    fertilizerType: () => void;
    fertilizerForm: () => void;
  };
}

export function ActiveFiltersBadges({
  filters,
  onClearFilters,
}: ActiveFiltersBadgesProps) {
  const t_grows = useTranslations("Grows");

  // Helper function to create labels with emoji
  const createLabelWithEmoji = (emoji: string, label: string): string => {
    return `${emoji} ${label}`;
  };

  // Safe translation helper to avoid recursion
  const safeTranslate = (key: string, fallback: string): string => {
    try {
      return t_grows(key) || fallback;
    } catch (e) {
      console.error(`Translation error for key ${key}:`, e);
      return fallback;
    }
  };

  const hasActiveFilters =
    filters.search ||
    filters.username ||
    filters.environment ||
    filters.cultureMedium ||
    filters.fertilizerType ||
    filters.fertilizerForm;

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Search Term Badge */}
      {filters.search && (
        <Badge
          variant="secondary"
          className="hover:bg-destructive flex cursor-pointer items-center gap-1"
          onClick={onClearFilters.search}
        >
          <Search className="h-3 w-3" />
          <span className="max-w-32 truncate">{filters.search}</span>
          <X className="h-3 w-3" />
        </Badge>
      )}

      {/* Username Badge */}
      {filters.username && (
        <Badge
          variant="secondary"
          className="hover:bg-destructive flex cursor-pointer items-center gap-1"
          onClick={onClearFilters.username}
        >
          <User className="h-3 w-3" />
          <span className="max-w-32 truncate">
            {"@"}
            {filters.username}
          </span>
          <X className="h-3 w-3" />
        </Badge>
      )}

      {/* Environment Filter Badge */}
      {filters.environment && (
        <Badge
          variant="secondary"
          className="hover:bg-destructive flex cursor-pointer items-center gap-1"
          onClick={onClearFilters.environment}
        >
          <span>
            {createLabelWithEmoji(
              getGrowEnvironmentEmoji(filters.environment as GrowEnvironment),
              safeTranslate(
                getGrowEnvironmentTranslationKey(
                  filters.environment as GrowEnvironment,
                ),
                filters.environment,
              ),
            )}
          </span>
          <X className="h-3 w-3" />
        </Badge>
      )}

      {/* Culture Medium Filter Badge */}
      {filters.cultureMedium && (
        <Badge
          variant="secondary"
          className="hover:bg-destructive flex cursor-pointer items-center gap-1"
          onClick={onClearFilters.cultureMedium}
        >
          <span>
            {createLabelWithEmoji(
              getCultureMediumEmoji(filters.cultureMedium as CultureMedium),
              safeTranslate(
                getCultureMediumTranslationKey(
                  filters.cultureMedium as CultureMedium,
                ),
                filters.cultureMedium,
              ),
            )}
          </span>
          <X className="h-3 w-3" />
        </Badge>
      )}

      {/* Fertilizer Type Filter Badge */}
      {filters.fertilizerType && (
        <Badge
          variant="secondary"
          className="hover:bg-destructive flex cursor-pointer items-center gap-1"
          onClick={onClearFilters.fertilizerType}
        >
          <span>
            {createLabelWithEmoji(
              getFertilizerTypeEmoji(filters.fertilizerType as FertilizerType),
              safeTranslate(
                getFertilizerTypeTranslationKey(
                  filters.fertilizerType as FertilizerType,
                ),
                filters.fertilizerType,
              ),
            )}
          </span>
          <X className="h-3 w-3" />
        </Badge>
      )}

      {/* Fertilizer Form Filter Badge */}
      {filters.fertilizerForm && (
        <Badge
          variant="secondary"
          className="hover:bg-destructive flex cursor-pointer items-center gap-1"
          onClick={onClearFilters.fertilizerForm}
        >
          <span>
            {createLabelWithEmoji(
              getFertilizerFormEmoji(filters.fertilizerForm as FertilizerForm),
              safeTranslate(
                getFertilizerFormTranslationKey(
                  filters.fertilizerForm as FertilizerForm,
                ),
                filters.fertilizerForm,
              ),
            )}
          </span>
          <X className="h-3 w-3" />
        </Badge>
      )}
    </div>
  );
}
