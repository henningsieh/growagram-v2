"use client";

// src/components/features/Exploration/grows-filter-panel.tsx:
import * as React from "react";
import { useTranslations } from "next-intl";
import { FilterIcon, SearchIcon, XIcon } from "lucide-react";
import { parseAsString, useQueryStates } from "nuqs";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import {
  CULTURE_MEDIUM_EMOJIS,
  CULTURE_MEDIUM_TRANSLATION_KEYS,
  CultureMedium,
  FERTILIZER_FORM_EMOJIS,
  FERTILIZER_FORM_TRANSLATION_KEYS,
  FERTILIZER_TYPE_EMOJIS,
  FERTILIZER_TYPE_TRANSLATION_KEYS,
  FertilizerForm,
  FertilizerType,
  GROW_ENVIRONMENT_EMOJIS,
  GROW_ENVIRONMENT_TRANSLATION_KEYS,
  GrowEnvironment,
  createLabelWithEmoji,
} from "~/types/grow";

interface GrowFilterSidebarProps {
  className?: string;
}

export function GrowsFilterPanel({ className }: GrowFilterSidebarProps) {
  const t_filter = useTranslations("Exploration.Grows.Filters");
  const t = useTranslations("Grows");

  // URL state management with nuqs
  const [filters, setFilters] = useQueryStates({
    search: parseAsString,
    environment: parseAsString,
    cultureMedium: parseAsString,
    fertilizerType: parseAsString,
    fertilizerForm: parseAsString,
  });

  const hasActiveFilters = React.useMemo(() => {
    return Object.values(filters).some(
      (value) => value !== null && value !== "",
    );
  }, [filters]);

  const clearAllFilters = async () => {
    await setFilters({
      search: null,
      environment: null,
      cultureMedium: null,
      fertilizerType: null,
      fertilizerForm: null,
    });
  };

  const clearFilter = async (key: keyof typeof filters) => {
    await setFilters({ [key]: null });
  };

  // Helper functions to get translated option text with emojis
  const getEnvironmentLabel = (value: string) => {
    const environment = value as GrowEnvironment;
    return createLabelWithEmoji(
      GROW_ENVIRONMENT_EMOJIS[environment] || "",
      t(GROW_ENVIRONMENT_TRANSLATION_KEYS[environment] || value),
    );
  };

  const getCultureMediumLabel = (value: string) => {
    const medium = value as CultureMedium;
    return createLabelWithEmoji(
      CULTURE_MEDIUM_EMOJIS[medium] || "",
      t(CULTURE_MEDIUM_TRANSLATION_KEYS[medium] || value),
    );
  };

  const getFertilizerTypeLabel = (value: string) => {
    const type = value as FertilizerType;
    return createLabelWithEmoji(
      FERTILIZER_TYPE_EMOJIS[type] || "",
      t(FERTILIZER_TYPE_TRANSLATION_KEYS[type] || value),
    );
  };

  const getFertilizerFormLabel = (value: string) => {
    const form = value as FertilizerForm;
    return createLabelWithEmoji(
      FERTILIZER_FORM_EMOJIS[form] || "",
      t(FERTILIZER_FORM_TRANSLATION_KEYS[form] || value),
    );
  };

  return (
    <div className={className}>
      {/* Header with Search - optimized for mobile */}
      <div className="space-y-3">
        {/* Filter title and search in one row */}
        <div className="flex items-center gap-3">
          <div className="flex shrink-0 items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            <Label className="text-sm font-medium">{t_filter("title")}</Label>
          </div>
          {/* Search takes up available space */}
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="search"
              placeholder={t_filter("search.placeholder")}
              value={filters.search || ""}
              onChange={(e) => setFilters({ search: e.target.value || null })}
              className="h-9 pl-10"
            />
          </div>
          {/* Clear all button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-destructive h-9 shrink-0 px-2"
            >
              {t_filter("clearAll")}
            </Button>
          )}
        </div>

        {/* Filter dropdowns in optimized mobile-first grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {/* Environment Filter */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">
              {t("environment-label")}
            </Label>
            <Select
              value={filters.environment || undefined}
              onValueChange={(value) =>
                setFilters({ environment: value || null })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder={t("environment-placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(GrowEnvironment).map((environment) => (
                  <SelectItem key={environment} value={environment}>
                    {createLabelWithEmoji(
                      GROW_ENVIRONMENT_EMOJIS[environment],
                      t(GROW_ENVIRONMENT_TRANSLATION_KEYS[environment]),
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Culture Medium Filter */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">
              {t("culture-medium-label")}
            </Label>
            <Select
              value={filters.cultureMedium || undefined}
              onValueChange={(value) =>
                setFilters({ cultureMedium: value || null })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder={t("culture-medium-placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CultureMedium).map((medium) => (
                  <SelectItem key={medium} value={medium}>
                    {createLabelWithEmoji(
                      CULTURE_MEDIUM_EMOJIS[medium],
                      t(CULTURE_MEDIUM_TRANSLATION_KEYS[medium]),
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fertilizer Type Filter */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">
              {t("fertilizer-type-label")}
            </Label>
            <Select
              value={filters.fertilizerType || undefined}
              onValueChange={(value) =>
                setFilters({ fertilizerType: value || null })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder={t("fertilizer-type-placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(FertilizerType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {createLabelWithEmoji(
                      FERTILIZER_TYPE_EMOJIS[type],
                      t(FERTILIZER_TYPE_TRANSLATION_KEYS[type]),
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fertilizer Form Filter */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">
              {t("fertilizer-form-label")}
            </Label>
            <Select
              value={filters.fertilizerForm || undefined}
              onValueChange={(value) =>
                setFilters({ fertilizerForm: value || null })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder={t("fertilizer-form-placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(FertilizerForm).map((form) => (
                  <SelectItem key={form} value={form}>
                    {createLabelWithEmoji(
                      FERTILIZER_FORM_EMOJIS[form],
                      t(FERTILIZER_FORM_TRANSLATION_KEYS[form]),
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <>
          <Separator className="my-4" />
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t_filter("activeFilters")}
            </Label>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary" className="gap-1">
                  {t_filter("search.label")}
                  {": "}
                  {filters.search}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-destructive hover:text-destructive-foreground h-auto p-0.5"
                    onClick={() => clearFilter("search")}
                  >
                    <XIcon className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.environment && (
                <Badge variant="secondary" className="gap-1">
                  {getEnvironmentLabel(filters.environment)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-destructive hover:text-destructive-foreground h-auto p-0.5"
                    onClick={() => clearFilter("environment")}
                  >
                    <XIcon className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.cultureMedium && (
                <Badge variant="secondary" className="gap-1">
                  {getCultureMediumLabel(filters.cultureMedium)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-destructive hover:text-destructive-foreground h-auto p-0.5"
                    onClick={() => clearFilter("cultureMedium")}
                  >
                    <XIcon className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.fertilizerType && (
                <Badge variant="secondary" className="gap-1">
                  {getFertilizerTypeLabel(filters.fertilizerType)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-destructive hover:text-destructive-foreground h-auto p-0.5"
                    onClick={() => clearFilter("fertilizerType")}
                  >
                    <XIcon className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.fertilizerForm && (
                <Badge variant="secondary" className="gap-1">
                  {getFertilizerFormLabel(filters.fertilizerForm)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-destructive hover:text-destructive-foreground h-auto p-0.5"
                    onClick={() => clearFilter("fertilizerForm")}
                  >
                    <XIcon className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
