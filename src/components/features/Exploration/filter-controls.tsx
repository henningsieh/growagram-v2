"use client";

import { useTranslations } from "next-intl";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
import {
  CultureMedium,
  FertilizerForm,
  FertilizerType,
  GrowEnvironment,
} from "~/types/grow";

interface FilterControlsProps {
  filters: {
    environment: string | null;
    cultureMedium: string | null;
    fertilizerType: string | null;
    fertilizerForm: string | null;
  };
  onFilterChange: {
    environment: (value: string) => void;
    cultureMedium: (value: string) => void;
    fertilizerType: (value: string) => void;
    fertilizerForm: (value: string) => void;
  };
}

export function FilterControls({
  filters,
  onFilterChange,
}: FilterControlsProps) {
  const t = useTranslations("Exploration");
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

  return (
    <div className="grid grid-cols-1 grid-cols-2 items-start gap-2">
      {/* Environment Filter */}
      <div className="space-y-2">
        <Label>{t("filters.environment.label")}</Label>
        <Select
          value={filters.environment || undefined}
          onValueChange={onFilterChange.environment}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("filters.environment.all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clear">
              {t("filters.environment.all")}
            </SelectItem>
            <SelectItem value={GrowEnvironment.INDOOR}>
              {createLabelWithEmoji(
                getGrowEnvironmentEmoji(GrowEnvironment.INDOOR),
                safeTranslate(
                  getGrowEnvironmentTranslationKey(GrowEnvironment.INDOOR),
                  "Indoor",
                ),
              )}
            </SelectItem>
            <SelectItem value={GrowEnvironment.OUTDOOR}>
              {createLabelWithEmoji(
                getGrowEnvironmentEmoji(GrowEnvironment.OUTDOOR),
                safeTranslate(
                  getGrowEnvironmentTranslationKey(GrowEnvironment.OUTDOOR),
                  "Outdoor",
                ),
              )}
            </SelectItem>
            <SelectItem value={GrowEnvironment.GREENHOUSE}>
              {createLabelWithEmoji(
                getGrowEnvironmentEmoji(GrowEnvironment.GREENHOUSE),
                safeTranslate(
                  getGrowEnvironmentTranslationKey(GrowEnvironment.GREENHOUSE),
                  "Greenhouse",
                ),
              )}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Culture Medium Filter */}
      <div className="space-y-2">
        <Label>{t("filters.culture-medium.label")}</Label>
        <Select
          value={filters.cultureMedium || undefined}
          onValueChange={onFilterChange.cultureMedium}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("filters.culture-medium.all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clear">
              {t("filters.culture-medium.all")}
            </SelectItem>
            <SelectItem value={CultureMedium.SOIL}>
              {createLabelWithEmoji(
                getCultureMediumEmoji(CultureMedium.SOIL),
                safeTranslate(
                  getCultureMediumTranslationKey(CultureMedium.SOIL),
                  "Soil",
                ),
              )}
            </SelectItem>
            <SelectItem value={CultureMedium.COCO}>
              {createLabelWithEmoji(
                getCultureMediumEmoji(CultureMedium.COCO),
                safeTranslate(
                  getCultureMediumTranslationKey(CultureMedium.COCO),
                  "Coco",
                ),
              )}
            </SelectItem>
            <SelectItem value={CultureMedium.HYDROPONIC}>
              {createLabelWithEmoji(
                getCultureMediumEmoji(CultureMedium.HYDROPONIC),
                safeTranslate(
                  getCultureMediumTranslationKey(CultureMedium.HYDROPONIC),
                  "Hydroponic",
                ),
              )}
            </SelectItem>
            <SelectItem value={CultureMedium.ROCKWOOL}>
              {createLabelWithEmoji(
                getCultureMediumEmoji(CultureMedium.ROCKWOOL),
                safeTranslate(
                  getCultureMediumTranslationKey(CultureMedium.ROCKWOOL),
                  "Rockwool",
                ),
              )}
            </SelectItem>
            <SelectItem value={CultureMedium.PERLITE}>
              {createLabelWithEmoji(
                getCultureMediumEmoji(CultureMedium.PERLITE),
                safeTranslate(
                  getCultureMediumTranslationKey(CultureMedium.PERLITE),
                  "Perlite",
                ),
              )}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Fertilizer Type Filter */}
      <div className="space-y-2">
        <Label>{t("filters.fertilizer-type.label")}</Label>
        <Select
          value={filters.fertilizerType || undefined}
          onValueChange={onFilterChange.fertilizerType}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("filters.fertilizer-type.all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clear">
              {t("filters.fertilizer-type.all")}
            </SelectItem>
            <SelectItem value={FertilizerType.ORGANIC}>
              {createLabelWithEmoji(
                getFertilizerTypeEmoji(FertilizerType.ORGANIC),
                safeTranslate(
                  getFertilizerTypeTranslationKey(FertilizerType.ORGANIC),
                  "Organic",
                ),
              )}
            </SelectItem>
            <SelectItem value={FertilizerType.MINERAL}>
              {createLabelWithEmoji(
                getFertilizerTypeEmoji(FertilizerType.MINERAL),
                safeTranslate(
                  getFertilizerTypeTranslationKey(FertilizerType.MINERAL),
                  "Mineral",
                ),
              )}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Fertilizer Form Filter */}
      <div className="space-y-2">
        <Label>{t("filters.fertilizer-form.label")}</Label>
        <Select
          value={filters.fertilizerForm || undefined}
          onValueChange={onFilterChange.fertilizerForm}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("filters.fertilizer-form.all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clear">
              {t("filters.fertilizer-form.all")}
            </SelectItem>
            <SelectItem value={FertilizerForm.LIQUID}>
              {createLabelWithEmoji(
                getFertilizerFormEmoji(FertilizerForm.LIQUID),
                safeTranslate(
                  getFertilizerFormTranslationKey(FertilizerForm.LIQUID),
                  "Liquid",
                ),
              )}
            </SelectItem>
            <SelectItem value={FertilizerForm.GRANULAR}>
              {createLabelWithEmoji(
                getFertilizerFormEmoji(FertilizerForm.GRANULAR),
                safeTranslate(
                  getFertilizerFormTranslationKey(FertilizerForm.GRANULAR),
                  "Granular",
                ),
              )}
            </SelectItem>
            <SelectItem value={FertilizerForm.SLOW_RELEASE}>
              {createLabelWithEmoji(
                getFertilizerFormEmoji(FertilizerForm.SLOW_RELEASE),
                safeTranslate(
                  getFertilizerFormTranslationKey(FertilizerForm.SLOW_RELEASE),
                  "Slow Release",
                ),
              )}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
