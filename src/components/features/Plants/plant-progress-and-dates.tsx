// src/components/features/Plants/plant-progress-and-dates.tsx:
import { useLocale, useTranslations } from "next-intl";

import {
  FlowerIcon,
  LeafIcon,
  NutIcon,
  PillBottleIcon,
  SproutIcon,
  WheatIcon,
} from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";

import {
  HybridTooltip,
  HybridTooltipContent,
  HybridTooltipTrigger,
} from "~/components/atom/hybrid-tooltip";

import type { PlantByIdType } from "~/server/api/root";

import { Locale } from "~/types/locale";

import { formatAbsoluteDate } from "~/lib/utils";
import { calculateGrowthProgress } from "~/lib/utils/calculateGrowthProgress";

export function PlantProgressAndDates({ plant }: { plant: PlantByIdType }) {
  const locale = useLocale();
  const t = useTranslations("Plants");
  const progress = calculateGrowthProgress(plant);

  return (
    <Card className="bg-muted/30 gap-2 space-y-4 rounded-md p-4 py-3">
      <CardHeader className="flex w-full flex-col p-0">
        <div className="mb-1 flex w-full justify-between text-sm">
          <span>{t("overall-progress")}</span>
          <span>
            {progress.overallProgress}
            {"%"}
          </span>
        </div>
        <Progress value={progress.overallProgress} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-2 p-0">
        <div className="flex h-4 items-center">
          <HybridTooltip>
            <HybridTooltipTrigger className="flex cursor-default items-center font-mono text-sm font-semibold tracking-tighter">
              <NutIcon className={`text-planted mr-2 h-4 w-4`} />
              {formatAbsoluteDate(plant.startDate, locale as Locale, {
                force: true,
              })}
            </HybridTooltipTrigger>
            <HybridTooltipContent
              side="right"
              className="w-auto border-0 bg-transparent p-2"
            >
              <Badge
                variant={"outline"}
                className="bg-planted border-0 text-sm whitespace-nowrap text-white"
              >
                {t("planting-date")}
              </Badge>
            </HybridTooltipContent>
          </HybridTooltip>
        </div>
        <div className="flex h-4 items-center">
          <HybridTooltip>
            <HybridTooltipTrigger className="flex cursor-default items-center font-mono text-sm font-semibold tracking-tighter">
              <SproutIcon
                className={`mr-2 h-4 w-4 ${
                  plant.seedlingPhaseStart
                    ? "text-seedling"
                    : "text-seedling/40"
                }`}
              />
              {plant.seedlingPhaseStart &&
                formatAbsoluteDate(plant.seedlingPhaseStart, locale as Locale, {
                  force: true,
                })}
            </HybridTooltipTrigger>
            <HybridTooltipContent
              side="right"
              className="w-auto border-0 bg-transparent p-2"
            >
              <Badge
                variant={"outline"}
                className="bg-seedling border-0 text-sm whitespace-nowrap text-white"
              >
                {t("germination-date")}
              </Badge>
            </HybridTooltipContent>
          </HybridTooltip>
        </div>
        <div className="flex h-4 items-center">
          <HybridTooltip>
            <HybridTooltipTrigger className="flex cursor-default items-center font-mono text-sm font-semibold tracking-tighter">
              <LeafIcon
                className={`mr-2 h-4 w-4 ${
                  plant.vegetationPhaseStart
                    ? "text-vegetation"
                    : "text-vegetation/40"
                }`}
              />
              {plant.vegetationPhaseStart &&
                formatAbsoluteDate(
                  plant.vegetationPhaseStart,
                  locale as Locale,
                  {
                    force: true,
                  },
                )}
            </HybridTooltipTrigger>
            <HybridTooltipContent
              side="right"
              className="w-auto border-0 bg-transparent p-2"
            >
              <Badge
                variant={"outline"}
                className="bg-vegetation border-0 text-sm whitespace-nowrap text-white"
              >
                {t("vegetation-start-date")}
              </Badge>
            </HybridTooltipContent>
          </HybridTooltip>
        </div>
        <div className="flex h-4 items-center">
          <HybridTooltip>
            <HybridTooltipTrigger className="flex cursor-default items-center font-mono text-sm font-semibold tracking-tighter">
              <FlowerIcon
                className={`mr-2 h-4 w-4 ${
                  plant.floweringPhaseStart
                    ? "text-flowering"
                    : "text-flowering/40"
                }`}
              />
              {plant.floweringPhaseStart &&
                formatAbsoluteDate(
                  plant.floweringPhaseStart,
                  locale as Locale,
                  {
                    force: true,
                  },
                )}
            </HybridTooltipTrigger>
            <HybridTooltipContent
              side="right"
              className="w-auto border-0 bg-transparent p-2"
            >
              <Badge
                variant={"outline"}
                className="bg-flowering border-0 text-sm whitespace-nowrap text-white"
              >
                {t("flowering-start-date")}
              </Badge>
            </HybridTooltipContent>
          </HybridTooltip>
        </div>
        <div className="flex h-4 items-center">
          <HybridTooltip>
            <HybridTooltipTrigger className="flex cursor-default items-center font-mono text-sm font-semibold tracking-tighter">
              <WheatIcon
                className={`mr-2 h-4 w-4 ${
                  plant.harvestDate ? "text-harvest" : "text-harvest/40"
                }`}
              />
              {plant.harvestDate &&
                formatAbsoluteDate(plant.harvestDate, locale as Locale, {
                  force: true,
                })}
            </HybridTooltipTrigger>
            <HybridTooltipContent
              side="right"
              className="w-auto border-0 bg-transparent p-2"
            >
              <Badge
                variant={"outline"}
                className="bg-harvest text-sm whitespace-nowrap text-white"
              >
                {t("harvest-date")}
              </Badge>
            </HybridTooltipContent>
          </HybridTooltip>
        </div>
        <div className="flex h-4 items-center">
          <HybridTooltip>
            <HybridTooltipTrigger className="flex cursor-default items-center font-mono text-sm font-semibold tracking-tighter">
              <PillBottleIcon
                className={`mr-2 h-4 w-4 ${
                  plant.curingPhaseStart ? "text-curing" : "text-curing/40"
                }`}
              />
              {plant.curingPhaseStart &&
                formatAbsoluteDate(plant.curingPhaseStart, locale as Locale, {
                  force: true,
                })}
            </HybridTooltipTrigger>
            <HybridTooltipContent
              side="right"
              className="w-auto border-0 bg-transparent p-2"
            >
              <Badge
                variant={"outline"}
                className="bg-curing text-sm whitespace-nowrap text-white"
              >
                {t("curing-start-date")}
              </Badge>
            </HybridTooltipContent>
          </HybridTooltip>
        </div>
      </CardContent>
    </Card>
  );
}
