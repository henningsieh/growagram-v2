"use client";

// src/components/features/Grows/grow-plant-card.tsx:
import { AnimatePresence, motion } from "framer-motion";
import { Calendar1, Clock, Dna, FlaskConical, Leaf, Tag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useIsMobile } from "~/hooks/use-mobile";
import { Link } from "~/lib/i18n/routing";
import { DateFormatOptions, formatDate } from "~/lib/utils";
import { calculateGrowthProgress } from "~/lib/utils/calculateDetailedGrowthProgress";
import { GetOwnPlantType } from "~/server/api/root";
import { PlantGrowthStages } from "~/types/plant";

interface PlantCardProps {
  plant: GetOwnPlantType;
}

export function GrowPlantCard({ plant }: PlantCardProps) {
  const locale = useLocale();
  const t = useTranslations();
  const isMobile = useIsMobile();
  const [isHovered, setIsHovered] = useState(false);

  const progress = calculateGrowthProgress(plant);
  const currentStage = PlantGrowthStages.find(
    (stage) => stage.name === progress.currentPhase,
  )!;

  const formatDaysRemaining = (days: number | null) => {
    if (!days) return null;
    return days > 1 ? `${days} days` : `${days} day`;
  };

  return (
    <TooltipProvider>
      <Card
        className="overflow-hidden p-3 transition-all hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="px-0 py-0">
          <CardTitle as="h2" className="flex items-center justify-between">
            <Button asChild variant="link" className="p-1">
              <Link
                href={`/public/plants/${plant.id}`}
                className="items-center gap-2"
              >
                <Tag size={20} className="hover:underline" />
                {plant.name}
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              {progress.estimatedHarvestDate && (
                <Tooltip>
                  <TooltipTrigger className="cursor-help">
                    <Clock className={`h-4 w-4 text-${currentStage.color}`} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {t("Plants.estimated-harvest")}:{" "}
                      {formatDate(progress.estimatedHarvestDate, locale, {
                        includeYear: true,
                      } as DateFormatOptions)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger>
                  <div
                    className={`h-3 w-3 rounded-full bg-${currentStage.color}`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p>
                      {
                        t("Grows.growth-stage")
                        // eslint-disable-next-line react/jsx-no-literals
                      }
                      : {currentStage.name}
                    </p>
                    {progress.daysUntilNextPhase && (
                      <p className="text-sm text-muted-foreground">
                        {formatDaysRemaining(progress.daysUntilNextPhase)}{" "}
                        {t("Plants.until")} {progress.nextPhase}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardTitle>
          <CardDescription>
            {progress.daysUntilNextPhase && progress.nextPhase && (
              <div className="mt-1 text-xs text-muted-foreground">
                {formatDaysRemaining(progress.daysUntilNextPhase)}{" "}
                {t("Plants.until")} {progress.nextPhase}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4 p-0">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>
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
            </span>
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
          <Progress value={progress.overallProgress} className="mb-4 h-2" />

          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0.4 }}
              animate={{ opacity: isMobile ? 1 : isHovered ? 1 : 0.4 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-2 gap-2">
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-2">
                    <Calendar1 className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {formatDate(plant.startDate, locale, {
                        includeYear: false,
                      } as DateFormatOptions)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("Plants.planting-date")}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-2">
                    <Leaf className={`h-4 w-4 text-${currentStage.color}`} />
                    <span className="text-sm">{currentStage.name}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p>{t("Plants.growth-progress")}</p>
                      <p className="text-sm text-muted-foreground">
                        {
                          t("Plants.phase")
                          // eslint-disable-next-line react/jsx-no-literals
                        }
                        : {progress.phaseProgress}%
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
                {plant.strain && (
                  <>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-2">
                        <FlaskConical className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">
                          {t("Plants.thc")}: {plant.strain.thcContent ?? "N/A"}%
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("Plants.thc-content")}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-2">
                        <Dna className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">
                          {plant.strain.breeder.name}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("Plants.breeder")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex w-full justify-end p-0">
          <Link href={`/plants/${plant.id}/form`}>
            <Button size="sm" variant="link">
              edit
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
