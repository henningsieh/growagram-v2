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
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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
import { calculateGrowthProgress } from "~/lib/utils/calculateDetailedGrowthProgress";
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
    plant.plantImages?.[0]?.image?.imageUrl || plant.headerImage?.imageUrl;

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarImage src={imageUrl || ""} alt={plant.name} />
                <AvatarFallback>
                  <CurrentPhaseIcon
                    className={`h-6 w-6 text-${currentPhase.color}`}
                  />
                </AvatarFallback>
              </Avatar>

              <div>
                <CardTitle as="h2" className="text-base">
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
                  <HybridTooltipContent className="w-auto bg-harvest p-1">
                    <div className="space-y-0">
                      <p className="text-sm">
                        {t("Plants.estimated-harvest")}:{" "}
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
                      className="text-muted-foreground hover:text-primary"
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
                      {progress.phaseProgress}%
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

              {plant.strain && (
                <>
                  <HybridTooltip>
                    <HybridTooltipTrigger className="flex items-center gap-1">
                      <BeanIcon className="h-4 w-4 shrink-0" />
                      <span className="text-sm">
                        {plant.strain.name ?? "N/A"}
                      </span>
                    </HybridTooltipTrigger>
                    <HybridTooltipContent>
                      <p>{t("Plants.strain")}</p>
                    </HybridTooltipContent>
                  </HybridTooltip>

                  <HybridTooltip>
                    <HybridTooltipTrigger className="flex items-center gap-1 overflow-hidden whitespace-nowrap">
                      <Dna className="h-4 w-4 shrink-0" />
                      <span className="text-sm">
                        {plant.strain.breeder.name}
                      </span>
                    </HybridTooltipTrigger>
                    <HybridTooltipContent>
                      <p>{t("Plants.breeder")}</p>
                    </HybridTooltipContent>
                  </HybridTooltip>

                  {plant.strain.thcContent && (
                    <HybridTooltip>
                      <HybridTooltipTrigger className="hidden items-center gap-1 xs:flex">
                        <FlaskConical className="h-4 w-4" />
                        <span className="text-sm">
                          {plant.strain.thcContent}
                          {"%"}
                        </span>
                      </HybridTooltipTrigger>
                      <HybridTooltipContent>
                        <p>{t("Plants.thc-content")}</p>
                      </HybridTooltipContent>
                    </HybridTooltip>
                  )}
                </>
              )}
            </CardFooter>
          </motion.div>
        </AnimatePresence>
      </Card>
    </TouchProvider>
  );
}
