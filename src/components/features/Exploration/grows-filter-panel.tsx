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
  CultureMedium,
  FertilizerForm,
  FertilizerType,
  GrowEnvironment,
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

  // Helper functions to get translated option text
  const getEnvironmentLabel = (value: string) => {
    switch (value) {
      case "INDOOR":
        return t("environment-indoor");
      case "OUTDOOR":
        return t("environment-outdoor");
      case "GREENHOUSE":
        return t("environment-greenhouse");
      default:
        return value;
    }
  };

  const getCultureMediumLabel = (value: string) => {
    switch (value) {
      case "SOIL":
        return t("culture-medium-soil");
      case "COCO":
        return t("culture-medium-coco");
      case "HYDRO":
        return t("culture-medium-hydro");
      case "ROCKWOOL":
        return t("culture-medium-rockwool");
      case "PERLITE":
        return t("culture-medium-perlite");
      case "VERMICULITE":
        return t("culture-medium-vermiculite");
      default:
        return value;
    }
  };

  const getFertilizerTypeLabel = (value: string) => {
    switch (value) {
      case "ORGANIC":
        return t("fertilizer-type-organic");
      case "MINERAL":
        return t("fertilizer-type-mineral");
      default:
        return value;
    }
  };

  const getFertilizerFormLabel = (value: string) => {
    switch (value) {
      case "LIQUID":
        return t("fertilizer-form-liquid");
      case "GRANULAR":
        return t("fertilizer-form-granular");
      case "SLOW_RELEASE":
        return t("fertilizer-form-slow_release");
      default:
        return value;
    }
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterIcon className="h-5 w-5" />
          <h2 className="text-lg font-semibold">{t_filter("title")}</h2>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-destructive"
          >
            {t_filter("clearAll")}
          </Button>
        )}
      </div>

      <Separator className="my-4" />

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium">
          {t_filter("search.label")}
        </Label>
        <div className="relative">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            id="search"
            placeholder={t_filter("search.placeholder")}
            value={filters.search || ""}
            onChange={(e) => setFilters({ search: e.target.value || null })}
            className="pl-10"
          />
        </div>
      </div>

      <Separator className="my-4" />

      {/* Environment Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t("environment-label")}</Label>
        <Select
          value={filters.environment || undefined}
          onValueChange={(value) => setFilters({ environment: value || null })}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("environment-placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={GrowEnvironment.INDOOR}>
              {t("environment-indoor")}
            </SelectItem>
            <SelectItem value={GrowEnvironment.OUTDOOR}>
              {t("environment-outdoor")}
            </SelectItem>
            <SelectItem value={GrowEnvironment.GREENHOUSE}>
              {t("environment-greenhouse")}
            </SelectItem>
          </SelectContent>
        </Select>
        {filters.environment && (
          <Badge
            variant="secondary"
            className="cursor-pointer"
            onClick={() => clearFilter("environment")}
          >
            {getEnvironmentLabel(filters.environment)}
            <XIcon className="ml-1 h-3 w-3" />
          </Badge>
        )}
      </div>

      {/* Culture Medium Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {t("culture-medium-label")}
        </Label>
        <Select
          value={filters.cultureMedium || undefined}
          onValueChange={(value) =>
            setFilters({ cultureMedium: value || null })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("culture-medium-placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={CultureMedium.SOIL}>
              {t("culture-medium-soil")}
            </SelectItem>
            <SelectItem value={CultureMedium.COCO}>
              {t("culture-medium-coco")}
            </SelectItem>
            <SelectItem value={CultureMedium.HYDRO}>
              {t("culture-medium-hydro")}
            </SelectItem>
            <SelectItem value={CultureMedium.ROCKWOOL}>
              {t("culture-medium-rockwool")}
            </SelectItem>
            <SelectItem value={CultureMedium.PERLITE}>
              {t("culture-medium-perlite")}
            </SelectItem>
            <SelectItem value={CultureMedium.VERMICULITE}>
              {t("culture-medium-vermiculite")}
            </SelectItem>
          </SelectContent>
        </Select>
        {filters.cultureMedium && (
          <Badge
            variant="secondary"
            className="cursor-pointer"
            onClick={() => clearFilter("cultureMedium")}
          >
            {getCultureMediumLabel(filters.cultureMedium)}
            <XIcon className="ml-1 h-3 w-3" />
          </Badge>
        )}
      </div>

      {/* Fertilizer Type Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {t("fertilizer-type-label")}
        </Label>
        <Select
          value={filters.fertilizerType || undefined}
          onValueChange={(value) =>
            setFilters({ fertilizerType: value || null })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("fertilizer-type-placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FertilizerType.ORGANIC}>
              {t("fertilizer-type-organic")}
            </SelectItem>
            <SelectItem value={FertilizerType.MINERAL}>
              {t("fertilizer-type-mineral")}
            </SelectItem>
          </SelectContent>
        </Select>
        {filters.fertilizerType && (
          <Badge
            variant="secondary"
            className="cursor-pointer"
            onClick={() => clearFilter("fertilizerType")}
          >
            {getFertilizerTypeLabel(filters.fertilizerType)}
            <XIcon className="ml-1 h-3 w-3" />
          </Badge>
        )}
      </div>

      {/* Fertilizer Form Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {t("fertilizer-form-label")}
        </Label>
        <Select
          value={filters.fertilizerForm || undefined}
          onValueChange={(value) =>
            setFilters({ fertilizerForm: value || null })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("fertilizer-form-placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FertilizerForm.LIQUID}>
              {t("fertilizer-form-liquid")}
            </SelectItem>
            <SelectItem value={FertilizerForm.GRANULAR}>
              {t("fertilizer-form-granular")}
            </SelectItem>
            <SelectItem value={FertilizerForm.SLOW_RELEASE}>
              {t("fertilizer-form-slow_release")}
            </SelectItem>
          </SelectContent>
        </Select>
        {filters.fertilizerForm && (
          <Badge
            variant="secondary"
            className="cursor-pointer"
            onClick={() => clearFilter("fertilizerForm")}
          >
            {getFertilizerFormLabel(filters.fertilizerForm)}
            <XIcon className="ml-1 h-3 w-3" />
          </Badge>
        )}
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
