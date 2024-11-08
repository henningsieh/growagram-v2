// src/components/features/plant/plant-card.tsx:
import { TooltipContent } from "@radix-ui/react-tooltip";
import { Flower2, Leaf, Nut, Sprout, Wheat } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { forwardRef, useState } from "react";
import headerImagePlaceholder from "~/assets/landscape-placeholdersvg.svg";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Tooltip, TooltipTrigger } from "~/components/ui/tooltip";
import { calculateGrowthProgress, formatDate } from "~/lib/utils";
import { OwnPlant } from "~/server/api/root";

interface PlantCardProps {
  plant: OwnPlant;
}

const PlantCard = forwardRef<HTMLDivElement, PlantCardProps>((props, ref) => {
  const { plant } = props;
  const locale = useLocale();

  const [isImageHovered, setIsImageHovered] = useState(false);

  const progress = calculateGrowthProgress(
    plant.startDate,
    plant.floweringPhaseStart,
  );

  return (
    <Card
      ref={ref}
      className="overflow-hidden transition-shadow duration-300 hover:shadow-lg"
    >
      <CardHeader className="p-0">
        <div
          className="relative aspect-video overflow-hidden"
          onMouseEnter={() => setIsImageHovered(true)}
          onMouseLeave={() => setIsImageHovered(false)}
        >
          <Image
            src={plant.headerImage?.imageUrl ?? headerImagePlaceholder}
            alt={plant.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-300"
            style={{
              transform: isImageHovered ? "scale(1.05)" : "scale(1)",
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle>{plant.name}</CardTitle>
        <CardDescription className="my-1 flex gap-1">
          <span>Strain: {plant.strain?.name ?? "Unknown"}</span>
          <span>|</span>
          <span>Breeder: {plant.strain?.breeder.name ?? "Unknown"}</span>
        </CardDescription>
        <div className="mt-4 space-y-2">
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center text-sm font-semibold">
                  <Nut className="mr-2 h-4 w-4" />
                  {formatDate(plant.startDate, locale)}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <Badge className="bg-planting ml-2 text-sm">
                  Seed planting date
                </Badge>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger>
                <Sprout className="mr-2 h-4 w-4" />
              </TooltipTrigger>
              {plant.seedlingPhaseStart &&
                formatDate(plant.seedlingPhaseStart, locale)}
              <TooltipContent side="right">
                <Badge className="whitespace-nowrap bg-seedling text-sm">
                  Germination date
                </Badge>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger>
                <Leaf className="mr-2 h-4 w-4" />
              </TooltipTrigger>
              {plant.vegetationPhaseStart &&
                formatDate(plant.vegetationPhaseStart, locale)}
              <TooltipContent side="right">
                <Badge className="whitespace-nowrap bg-vegetation text-sm">
                  Veg. start date
                </Badge>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger>
                <Flower2 className="mr-2 h-4 w-4" />
              </TooltipTrigger>
              {plant.floweringPhaseStart &&
                formatDate(plant.floweringPhaseStart, locale)}
              <TooltipContent side="right">
                <Badge className="whitespace-nowrap bg-flowering text-sm">
                  Flowering start date
                </Badge>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger>
                <Wheat className="mr-2 h-4 w-4" />
              </TooltipTrigger>
              {plant.harvestDate && formatDate(plant.harvestDate, locale)}
              <TooltipContent side="right">
                <Badge className="whitespace-nowrap bg-harvest text-sm">
                  Harvest date
                </Badge>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-sm">
            <span>Growth Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </CardContent>

      <CardFooter className="bg-muted/50 p-4">
        <div className="flex w-full items-center justify-between">
          <span className="text-sm text-muted-foreground">
            THC: {plant.strain?.thcContent ?? "N/A"}%
          </span>
          <span className="text-sm text-muted-foreground">
            CBD: {plant.strain?.cbdContent ?? "N/A"}%
          </span>
        </div>
      </CardFooter>
    </Card>
  );
});

// Set display name for debugging purposes
PlantCard.displayName = "PlantCard";

export default PlantCard;
