"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Calendar1, Dna, FlaskConical, Leaf, Tag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
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
import {
  DateFormatOptions,
  determineGrowthStage,
  formatDate,
} from "~/lib/utils";
import { GetOwnPlantType } from "~/server/api/root";

interface PlantCardProps {
  plant: GetOwnPlantType;
}

const growthStages = [
  { name: "planted", color: "planted" },
  { name: "seedling", color: "seedling" },
  { name: "vegetation", color: "vegetation" },
  { name: "flowering", color: "flowering" },
  { name: "harvest", color: "harvest" },
  { name: "curing", color: "curing" },
];

export function GrowPlantCard({ plant }: PlantCardProps) {
  const isMobile = useIsMobile();
  const [isHovered, setIsHovered] = useState(false);

  const growthStageIndex = useMemo(() => determineGrowthStage(plant), [plant]);
  const { name: stageName, color } = growthStages[growthStageIndex];
  const progress = ((growthStageIndex + 1) / growthStages.length) * 100;

  const locale = useLocale();
  const t = useTranslations();

  return (
    <TooltipProvider>
      <Card
        className="overflow-hidden p-3 transition-all hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="px-0 py-0">
          <CardTitle level="h2" className="flex items-center justify-between">
            <Button asChild variant="link" className="p-1">
              <Link
                href={`/public/plants/${plant.id}`}
                className="items-center gap-2"
              >
                <Tag size={20} className="hover:underline" />
                {plant.name}
              </Link>
            </Button>
            <Tooltip>
              <TooltipTrigger>
                <div className={`h-3 w-3 rounded-full bg-${color}`} />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {
                    t("Grows.growth-stage")
                    // eslint-disable-next-line react/jsx-no-literals
                  }
                  : {stageName}
                </p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent className="gap-4 p-0">
          <Progress value={progress} className="mb-4 h-2" />

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
                        // weekday: "short",
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
                    <Leaf className={`h-4 w-4 text-${color}`} />
                    <span className="text-sm">{stageName}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("Plants.growth-progress")}</p>
                  </TooltipContent>
                </Tooltip>
                {plant.strain && (
                  <>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-2">
                        <FlaskConical className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">
                          {
                            t("Plants.thc")
                            // eslint-disable-next-line react/jsx-no-literals
                          }
                          : {plant.strain.thcContent ?? "N/A"}%
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
            <Button size={"sm"} variant={"link"}>
              edit
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
