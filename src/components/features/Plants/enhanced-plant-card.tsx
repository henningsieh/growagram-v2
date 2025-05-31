"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, type LucideIcon, NutIcon, TentTreeIcon } from "lucide-react";
import { modulePaths } from "~/assets/constants";
import { CustomAvatar } from "~/components/atom/custom-avatar";
import {
  HybridTooltip,
  HybridTooltipContent,
  HybridTooltipTrigger,
  TouchProvider,
} from "~/components/atom/hybrid-tooltip";
import StrainBadge from "~/components/atom/strain-badge";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { useIsMobile } from "~/hooks/use-mobile";
import { Link } from "~/lib/i18n/routing";
import {
  type DateFormatOptions,
  cn,
  formatDate,
  formatDaysRemaining,
  formatDistanceToNowLocalized,
} from "~/lib/utils";
import { calculateGrowthProgress } from "~/lib/utils/calculateGrowthProgress";
import type { GetAllPlantType } from "~/server/api/root";
import { Locale } from "~/types/locale";
import { PlantGrowthStages } from "~/types/plant";

interface EnhancedPlantCardProps {
  plant: GetAllPlantType;
}

export function EnhancedPlantCard({ plant }: EnhancedPlantCardProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const isMobile = useIsMobile();
  const [isHovered, setIsHovered] = React.useState(false);

  const progress = calculateGrowthProgress(plant);
  const CurrentPhaseIcon = progress.phaseIcon satisfies LucideIcon;
  const currentPhase = PlantGrowthStages.find(
    (stage) => stage.name === progress.currentPhase,
  )!;

  // Get plant image URL
  const imageUrl =
    plant.plantImages && plant.plantImages.length > 0
      ? plant.plantImages.sort(
          (a, b) =>
            new Date(b.image.captureDate).getTime() -
            new Date(a.image.captureDate).getTime(),
        )[0].image.imageUrl
      : plant.headerImage?.imageUrl;

  // Format time ago
  const startedAt = formatDistanceToNowLocalized(plant.startDate, locale);

  // Get translated phase name
  const translatedPhaseName = t(`Plants.phases.${currentPhase.name}`);

  return (
    <TouchProvider>
      <Card
        className="border-primary/60 bg-muted/30 z-10 gap-0 space-y-2 overflow-hidden rounded-sm border p-2 transition-all hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="p-0">
          <div className="flex w-full items-start gap-2">
            <CustomAvatar
              src={imageUrl}
              alt={plant.name}
              size={40}
              className="size-10 shrink-0 rounded-md"
              fallback={
                <CurrentPhaseIcon
                  className={`h-6 w-6 text-${currentPhase.color}`}
                />
              }
            />

            {/* Middle section with plant name - will shrink as needed */}
            <div className="w-0 min-w-0 flex-1">
              <CardTitle as="h3" className="truncate">
                <Button
                  asChild
                  variant="link"
                  className="h-auto justify-start p-0"
                >
                  <Link
                    href={`${modulePaths.PUBLICPLANTS.path}/${plant.id}`}
                    className="truncate"
                  >
                    <span className="block truncate text-base">
                      {plant.name}
                    </span>
                  </Link>
                </Button>
              </CardTitle>
              <p className="text-muted-foreground truncate text-xs">
                {startedAt}
              </p>
            </div>

            <div className="flex items-center justify-end gap-4">
              {plant.strain && <StrainBadge strain={plant.strain} />}
            </div>

            {plant.grow && (
              <HybridTooltip>
                <HybridTooltipTrigger>
                  <Button
                    asChild
                    size={"icon"}
                    variant="secondary"
                    className="size-5.5 rounded-sm"
                    aria-label={"Link to Grow"}
                  >
                    <Link
                      href={`${modulePaths.PUBLICGROWS.path}/${plant.grow.id}`}
                      // className="text-muted-foreground hover:text-secondary"
                    >
                      <TentTreeIcon className="h-4 w-4" />
                    </Link>
                  </Button>
                </HybridTooltipTrigger>
                <HybridTooltipContent>{plant.grow.name}</HybridTooltipContent>
              </HybridTooltip>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0 pb-2">
          <div className="flex items-center gap-2">
            <Progress
              value={progress.overallProgress}
              className={`bg-muted-foreground/20 h-2 flex-1`}
            />
            <span className="text-xs font-medium whitespace-nowrap">
              {progress.overallProgress}
              {"%"}
            </span>
          </div>
        </CardContent>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: isMobile ? 1 : isHovered ? 1 : 0.6 }}
            transition={{ duration: 0.3 }}
          >
            <CardFooter className="text-muted-foreground flex h-7 items-center justify-between p-0">
              <HybridTooltip>
                <HybridTooltipTrigger className="flex items-center gap-2">
                  <NutIcon className="h-4 w-4 shrink-0" />
                  <span className="text-xs whitespace-nowrap">
                    {formatDate(plant.startDate, locale, {
                      includeYear: false,
                    } as DateFormatOptions)}
                  </span>
                </HybridTooltipTrigger>
                <HybridTooltipContent>
                  <p>{t("Plants.planting-date")}</p>
                </HybridTooltipContent>
              </HybridTooltip>

              {/* Right icons - fixed width, won't shrink */}
              <div className="flex shrink-0 items-center gap-2">
                {progress.estimatedHarvestDate && (
                  <HybridTooltip>
                    <HybridTooltipTrigger className="cursor-help">
                      <Clock className="text-harvest h-4 w-4 shrink-0" />
                    </HybridTooltipTrigger>
                    <HybridTooltipContent className="text-harvest w-auto p-1">
                      <div className="space-y-0">
                        <p className="text-sm">
                          {t("Plants.estimated-harvest")}
                          {":"}
                        </p>
                        <p className="text-base">
                          {formatDate(progress.estimatedHarvestDate, locale, {
                            includeYear: true,
                            force: true,
                          } as DateFormatOptions)}{" "}
                          {`(in ${formatDaysRemaining(
                            progress.daysUntilNextPhase,
                            t("Platform.day"),
                            t("Platform.days"),
                          )})`}
                        </p>
                      </div>
                    </HybridTooltipContent>
                  </HybridTooltip>
                )}

                <HybridTooltip>
                  <HybridTooltipTrigger asChild className="cursor-help">
                    <Badge
                      variant="outline"
                      className={cn(
                        // Replace dynamic interpolation with a mapping approach
                        currentPhase.color === "harvest" && "border-harvest",
                        currentPhase.color === "planted" && "border-planted",
                        currentPhase.color === "seedling" && "border-seedling",
                        currentPhase.color === "vegetation" &&
                          "border-vegetation",
                        currentPhase.color === "flowering" &&
                          "border-flowering",
                        currentPhase.color === "curing" && "border-curing",
                        // Same for background with opacity
                        currentPhase.color === "harvest" && "bg-harvest/10",
                        currentPhase.color === "planted" && "bg-planted/10",
                        currentPhase.color === "seedling" && "bg-seedling/10",
                        currentPhase.color === "vegetation" &&
                          "bg-vegetation/10",
                        currentPhase.color === "flowering" && "bg-flowering/10",
                        currentPhase.color === "curing" && "bg-curing/10",
                        // And text color
                        currentPhase.color === "harvest" && "text-harvest",
                        currentPhase.color === "planted" && "text-planted",
                        currentPhase.color === "seedling" && "text-seedling",
                        currentPhase.color === "vegetation" &&
                          "text-vegetation",
                        currentPhase.color === "flowering" && "text-flowering",
                        currentPhase.color === "curing" && "text-curing",
                      )}
                    >
                      <CurrentPhaseIcon className="mr-1 h-3 w-3 shrink-0" />
                      {translatedPhaseName}
                    </Badge>
                  </HybridTooltipTrigger>
                  <HybridTooltipContent
                    className={`w-auto text-${currentPhase.color} p-1`}
                  >
                    <div className="space-y-0">
                      <p className="text-sm">
                        {t("Grows.growth-stage")}
                        {": "}
                        {translatedPhaseName}
                      </p>
                      <p className="text-base">
                        {t("Plants.phase")}
                        {": "}
                        {progress.phaseProgress}
                        {"%"}
                      </p>
                    </div>
                  </HybridTooltipContent>
                </HybridTooltip>
              </div>
            </CardFooter>
          </motion.div>
        </AnimatePresence>
      </Card>
    </TouchProvider>
  );
}
