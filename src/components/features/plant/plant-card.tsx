// PlantCard.tsx
// Import your formatDate function
import { Flower2, Leaf, Loader2, Plus, Sprout, Sun, Wheat } from "lucide-react";
import { useLocale } from "next-intl";
// Adjust the import path as necessary
import Image from "next/image";
import React, { forwardRef, useState } from "react";
import headerImagePlaceholder from "~/assets/landscape-placeholdersvg.svg";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
// Adjust this import if you're not using Next.js
import { formatDate } from "~/lib/utils";
import { UserPlant } from "~/server/api/root";

// Define the props interface
interface PlantCardProps {
  plant: UserPlant;
}

// Use forwardRef to allow refs to be passed down
const PlantCard = forwardRef<HTMLDivElement, PlantCardProps>((props, ref) => {
  // Destructure props, and use ref
  const { plant } = props; // Destructure plant from props

  const locale = useLocale(); // Assuming you have this hook for localization
  const [isImageHovered, setIsImageHovered] = useState(false);

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
            className="object-cover transition-transform duration-300"
            style={{
              transform: isImageHovered ? "scale(1.05)" : "scale(1)",
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle>{plant.name}</CardTitle>
        <CardDescription>Strain: {plant.strain ?? "Unknown"}</CardDescription>
        <CardDescription>{plant.id}</CardDescription>
        <div className="mt-4 space-y-2">
          <div className="flex items-center">
            <Sprout className="mr-2 h-4 w-4" />
            <span className="text-sm">
              Seedling:{" "}
              {formatDate(plant.seedlingDate ?? new Date(), locale, {
                includeYear: true,
              })}
            </span>
          </div>
          <div className="flex items-center">
            <Leaf className="mr-2 h-4 w-4" />
            <span className="text-sm">
              Veg Phase:{" "}
              {formatDate(plant.vegPhaseDate ?? new Date(), locale, {
                includeYear: true,
              })}
            </span>
          </div>
          <div className="flex items-center">
            <Flower2 className="mr-2 h-4 w-4" />
            <span className="text-sm">
              Flower Phase:{" "}
              {formatDate(plant.flowerPhaseDate ?? new Date(), locale, {
                includeYear: true,
              })}
            </span>
          </div>
          <div className="flex items-center">
            <Wheat className="mr-2 h-4 w-4" />
            <span className="text-sm">
              Harvest Date:{" "}
              {formatDate(plant.harvesedtDate ?? new Date(), locale, {
                includeYear: true,
              })}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-sm">
            <span>Growth Progress</span>
            <span>{plant.growthProgress ?? 40}%</span>
          </div>
          <Progress value={plant.growthProgress ?? 40} className="w-full" />
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 p-4">
        <div className="flex w-full items-center justify-between">
          <span className="text-sm text-muted-foreground">
            THC: {plant.thcContent ?? "N/A"}%
          </span>
          <span className="text-sm text-muted-foreground">
            CBD: {plant.cbdContent ?? "N/A"}%
          </span>
        </div>
      </CardFooter>
    </Card>
  );
});

// Set display name for debugging purposes
PlantCard.displayName = "PlantCard";

export default PlantCard;
