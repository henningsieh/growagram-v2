"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BeanIcon,
  Calendar1Icon,
  Clock,
  Dna,
  FlaskConical,
  type LucideIcon,
  TentTree,
  TentTreeIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import CustomAvatar from "~/components/atom/custom-avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  HybridTooltip,
  HybridTooltipContent,
  HybridTooltipTrigger,
  TouchProvider,
} from "~/components/ui/hybrid-tooltip";
import { Progress } from "~/components/ui/progress";
import { useIsMobile } from "~/hooks/use-mobile";
import { Link } from "~/lib/i18n/routing";
import {
  type DateFormatOptions,
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
  const [isHovered, setIsHovered] = useState(false);

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
        className="space-y-2 overflow-hidden border border-primary/70 bg-muted p-2 transition-all hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="p-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <CustomAvatar
                src={imageUrl}
                alt={plant.name}
                size={40}
                className="size-10 rounded-md"
                fallback={
                  <CurrentPhaseIcon
                    className={`h-6 w-6 text-${currentPhase.color}`}
                  />
                }
              />

              <div>
                <CardTitle as="h4" className="text-base">
                  <Button
                    asChild
                    variant="link"
                    className="h-auto justify-start p-0"
                  >
                    <Link href={`/public/plants/${plant.id}`}>
                      {plant.name}
                    </Link>
                  </Button>
                </CardTitle>
                <p className="text-xs text-muted-foreground">{startedAt}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {progress.estimatedHarvestDate && (
                <HybridTooltip>
                  <HybridTooltipTrigger className="cursor-help">
                    <Clock className="h-4 w-4 shrink-0 text-harvest" />
                  </HybridTooltipTrigger>
                  <HybridTooltipContent className="w-auto p-1 text-harvest">
                    <div className="space-y-0">
                      <p className="text-sm">
                        {t("Plants.estimated-harvest")}
                        {":"}
                      </p>
                      <p className="text-base">
                        {formatDate(progress.estimatedHarvestDate, locale, {
                          includeYear: true,
                        } as DateFormatOptions)}{" "}
                        {`(in ${formatDaysRemaining(
                          progress.daysUntilNextPhase,
                          t("Common.day"),
                          t("Common.days"),
                        )})`}
                      </p>
                    </div>
                  </HybridTooltipContent>
                </HybridTooltip>
              )}

              {plant.grow && (
                <HybridTooltip>
                  <HybridTooltipTrigger>
                    <Link
                      href={`/public/grows/${plant.grow.id}`}
                      className="text-muted-foreground hover:text-secondary"
                    >
                      <TentTree className="h-4 w-4" />
                    </Link>
                  </HybridTooltipTrigger>
                  <HybridTooltipContent>{plant.grow.name}</HybridTooltipContent>
                </HybridTooltip>
              )}

              <HybridTooltip>
                <HybridTooltipTrigger className="cursor-help">
                  <Badge
                    variant="outline"
                    className={`border-${currentPhase.color} bg-${currentPhase.color}/10 text-${currentPhase.color}`}
                  >
                    <CurrentPhaseIcon className="mr-1 h-3 w-3" />
                    {translatedPhaseName}
                  </Badge>
                </HybridTooltipTrigger>
                <HybridTooltipContent
                  className={`w-auto bg-${currentPhase.color} p-1`}
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
          </div>
        </CardHeader>

        <CardContent className="p-0 pt-2">
          <div className="flex items-center gap-2">
            <Progress
              value={progress.overallProgress}
              className={`h-2 flex-1 bg-muted-foreground/20`}
            />
            <span className="whitespace-nowrap text-xs font-medium">
              {progress.overallProgress}
              {"%"}
            </span>
          </div>
        </CardContent>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: isMobile ? 1 : isHovered ? 1 : 0.4 }}
            transition={{ duration: 0.3 }}
          >
            <CardFooter className="flex items-center justify-between p-0 text-muted-foreground">
              <HybridTooltip>
                <HybridTooltipTrigger className="flex items-center gap-2">
                  <Calendar1Icon className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap text-sm">
                    {formatDate(plant.startDate, locale, {
                      includeYear: false,
                    } as DateFormatOptions)}
                  </span>
                </HybridTooltipTrigger>
                <HybridTooltipContent>
                  <p>{t("Plants.planting-date")}</p>
                </HybridTooltipContent>
              </HybridTooltip>

              <div className="flex items-center justify-end gap-1">
                {plant.strain && (
                  <HybridTooltip>
                    <HybridTooltipTrigger>
                      <Badge
                        variant="strain"
                        className="ml-auto flex items-center gap-1"
                      >
                        <BeanIcon className="h-3.5 w-3.5" />
                        <span>{plant.strain.name}</span>
                      </Badge>
                    </HybridTooltipTrigger>
                    <HybridTooltipContent>
                      <div className="space-y-2 p-1">
                        <div className="flex items-center gap-2">
                          <Dna className="h-4 w-4" />
                          <span>
                            {t("Plants.breeder")}
                            {": "}
                            {plant.strain.breeder.name}
                          </span>
                        </div>
                        {plant.strain.thcContent && (
                          <div className="flex items-center gap-2">
                            <FlaskConical className="h-4 w-4" />
                            <span>
                              {t("Plants.thc-content")}
                              {": "}
                              {plant.strain.thcContent}
                              {"%"}
                            </span>
                          </div>
                        )}
                      </div>
                    </HybridTooltipContent>
                  </HybridTooltip>
                )}
                {plant.grow && (
                  <Link href={`/public/grows/${plant.grow.id}`}>
                    <Badge
                      variant="grow"
                      className="flex max-w-20 items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap"
                    >
                      <TentTreeIcon className="h-4 w-4 flex-shrink-0" />
                      <span className="overflow-hidden text-ellipsis">
                        {plant.grow.name}
                      </span>
                    </Badge>
                  </Link>
                )}
              </div>
            </CardFooter>
          </motion.div>
        </AnimatePresence>
      </Card>
    </TouchProvider>
  );
}
