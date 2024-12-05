"use client";

import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar1, Dna, FlaskConical, Leaf } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useIsMobile } from "~/hooks/use-mobile";
import { determineGrowthStage } from "~/lib/utils";
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

  return (
    <TooltipProvider>
      <Card
        className="overflow-hidden transition-all hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-lg font-semibold">
              {plant.strain ? plant.strain.name : plant.name}
            </h4>
            <Tooltip>
              <TooltipTrigger>
                <div className={`h-3 w-3 rounded-full bg-${color}`} />
              </TooltipTrigger>
              <TooltipContent>
                <p>Growth Stage: {stageName}</p>
              </TooltipContent>
            </Tooltip>
          </div>
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
                      {format(plant.startDate, "MMM d, yyyy")}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Start Date</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-2">
                    <Leaf className={`h-4 w-4 text-${color}`} />
                    <span className="text-sm">{stageName}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Current Growth Stage</p>
                  </TooltipContent>
                </Tooltip>
                {plant.strain && (
                  <>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-2">
                        <FlaskConical className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">
                          THC: {plant.strain.thcContent ?? "N/A"}%
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>THC Content</p>
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
                        <p>Breeder</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
