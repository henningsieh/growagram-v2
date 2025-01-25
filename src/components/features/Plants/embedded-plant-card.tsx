"use client";

// src/components/features/Grows/grow-plant-card.tsx:
import { AnimatePresence, motion } from "framer-motion";
import {
  BeanIcon,
  Calendar1Icon,
  Clock,
  Dna,
  type LucideIcon,
  TagIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
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
import { type DateFormatOptions, formatDate } from "~/lib/utils";
import { calculateGrowthProgress } from "~/lib/utils/calculateDetailedGrowthProgress";
import type { GetAllPlantType } from "~/server/api/root";
import { PlantGrowthStages } from "~/types/plant";

interface EmbeddedPlantCardProps {
  plant: GetAllPlantType;
}

export function EmbeddedPlantCard({ plant }: EmbeddedPlantCardProps) {
  const locale = useLocale();
  const t = useTranslations();
  const isMobile = useIsMobile();
  const [isHovered, setIsHovered] = useState(false);

  const progress = calculateGrowthProgress(plant);
  const CurrentPhaseIcon = progress.phaseIcon satisfies LucideIcon;
  const currentPhase = PlantGrowthStages.find(
    (stage) => stage.name === progress.currentPhase,
  )!;

  const formatDaysRemaining = (days: number | null) => {
    if (!days) return null;
    return days > 1
      ? `${days} ${t("Common.days")}`
      : `${days} ${t("Common.day")}`;
  };

  return (
    <TouchProvider>
      <Card
        className="space-y-2 overflow-hidden border border-primary/70 bg-muted p-2 pt-0 transition-all hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="p-0">
          <CardTitle as="h2" className="flex items-center justify-between">
            <Button asChild variant="link" className="p-0">
              <Link
                href={`/public/plants/${plant.id}`}
                className="items-center gap-2"
              >
                <TagIcon size={20} />
                {plant.name}
              </Link>
            </Button>
            <div className="flex items-center gap-4">
              {progress.estimatedHarvestDate && (
                // Estimated Harvest Clock
                <HybridTooltip>
                  <HybridTooltipTrigger className="cursor-help">
                    <Clock className={`h-4 w-4 shrink-0 text-harvest`} />
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
                        {`(in ${formatDaysRemaining(progress.daysUntilNextPhase)})`}
                      </p>
                    </div>
                  </HybridTooltipContent>
                </HybridTooltip>
              )}

              {/* CurrentPhaseIcon */}
              <HybridTooltip>
                <HybridTooltipTrigger
                  className={`flex cursor-help items-center gap-2`}
                >
                  <CurrentPhaseIcon
                    className={`h-4 w-4 shrink-0 text-${currentPhase.color}`}
                  />
                  {/* <span className="text-sm">{currentPhase.name}</span> */}
                </HybridTooltipTrigger>
                <HybridTooltipContent
                  className={`w-auto p-1 bg-${currentPhase.color}`}
                >
                  <div className="space-y-0">
                    <p className="text-sm">
                      {
                        t("Grows.growth-stage")
                        // eslint-disable-next-line react/jsx-no-literals
                      }
                      : {currentPhase.name}
                    </p>
                    <p className="text-base">
                      {
                        t("Plants.phase")
                        // eslint-disable-next-line react/jsx-no-literals
                      }
                      :{" "}
                      {
                        progress.phaseProgress
                        // eslint-disable-next-line react/jsx-no-literals
                      }
                      %
                    </p>
                  </div>
                </HybridTooltipContent>
              </HybridTooltip>
            </div>
          </CardTitle>
          {/* <CardDescription>
              {progress.daysUntilNextPhase && progress.nextPhase && (
                <div className="flex items-center justify-end text-xs text-muted-foreground">
                  {formatDaysRemaining(progress.daysUntilNextPhase)}
                  {` ${t("Plants.until")} `}
                  {progress.nextPhase}
                </div>
              )}
            </CardDescription> */}
        </CardHeader>
        <CardContent className="p-0">
          <div>
            <div className="flex justify-start text-xs text-muted-foreground">
              {/* <span>
                {
                  t("Plants.phase")
                  // eslint-disable-next-line react/jsx-no-literals
                }
                :{" "}
                {
                  // eslint-disable-next-line react/jsx-no-literals
                  progress.phaseProgress
                  // eslint-disable-next-line react/jsx-no-literals
                }
                %
              </span> */}
              <span>
                {
                  t("Plants.overall-progress")
                  // eslint-disable-next-line react/jsx-no-literals
                }
                :{" "}
                {
                  progress.overallProgress
                  // eslint-disable-next-line react/jsx-no-literals
                }
                %
              </span>
            </div>
            <Progress value={progress.overallProgress} className="my-1 h-2" />
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
                  {/* Strain */}
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

                  {/* Breeder Name */}
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

                  {/* THC Gehalt */}
                  {/* <HybridTooltip>
                      <HybridTooltipTrigger className="hidden items-center gap-1 xs:flex">
                        <FlaskConical className="h-4 w-4" />
                        <span className="text-sm">
                          {plant.strain.thcContent ?? "N/A"}%
                        </span>
                      </HybridTooltipTrigger>
                      <HybridTooltipContent>
                        <p>{t("Plants.thc-content")}</p>
                      </HybridTooltipContent>
                    </HybridTooltip> */}
                </>
              )}
            </CardFooter>
          </motion.div>
        </AnimatePresence>

        {/* <CardFooter className="mt-2 flex w-full justify-end p-0">
            <Link href={`/plants/${plant.id}/form`}>
              <Button size="sm" variant="link" className="p-0">
                edit
              </Button>
            </Link>
          </CardFooter> */}
      </Card>
    </TouchProvider>
  );
}
