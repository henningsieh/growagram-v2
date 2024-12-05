"use client";

import { format } from "date-fns";
import { AnimatePresence, HTMLMotionProps, motion } from "framer-motion";
import {
  Calendar,
  ChartColumn,
  Dna,
  FlaskConical,
  Flower2,
  Heart,
  MessageCircle,
  Share,
  Trash2,
  User2,
} from "lucide-react";
import { Droplet, Leaf, Sun, Thermometer } from "lucide-react";
import { User } from "next-auth";
import Image from "next/image";
import { useMemo, useState } from "react";
import headerImagePlaceholder from "~/assets/landscape-placeholdersvg.svg";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Link } from "~/lib/i18n/routing";
import { GetOwnGrowType, GetOwnPlantType } from "~/server/api/root";

interface GrowCardProps {
  grow: GetOwnGrowType;
  onUnassignPlant?: (plantId: string) => void;
  showUnassignButton?: boolean;
  grower?: User;
  stats?: {
    comments: number;
    views: number;
    likes: number;
  };
}

export function GrowCard({
  grow,
  onUnassignPlant,
  showUnassignButton = true,
  grower = {
    name: "Django ElRey 🌱",
    email: "django@growagram.com",
    image: "/images/XYUV-dwm_400x400.jpg",
  },
  stats = {
    comments: 0,
    views: 0,
    likes: 0,
  },
}: GrowCardProps) {
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-0 p-4">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={grower.image as string | undefined} />
              <AvatarFallback>
                <User2 className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-semibold">{grower.name}</p>
              <p className="text-sm text-muted-foreground">@{grower.name}</p>
            </div>
          </div>
          {/* You might want to add a type field to your grow schema or remove this */}
          {/* <Badge
            variant={grow.type === "indoor" ? "default" : "secondary"}
            className="uppercase"
          >
            {grow.type}
          </Badge> */}
        </div>
      </CardHeader>

      <div
        className="relative aspect-video overflow-hidden"
        onMouseEnter={() => setIsImageHovered(true)}
        onMouseLeave={() => setIsImageHovered(false)}
      >
        <Image
          src={headerImagePlaceholder}
          alt={grow.name}
          fill
          className="object-cover transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          style={{
            transform: isImageHovered ? "scale(1.05)" : "scale(1)",
          }}
        />
      </div>

      <CardContent className="space-y-4 p-4">
        <div>
          <h3 className="text-xl font-bold">{grow.name}</h3>
          <CardDescription>
            <span className="block">
              Started on {format(grow.createdAt, "PPP")}
            </span>
            {grow.updatedAt && (
              <span className="block">
                Last updated {format(grow.updatedAt, "PPP")}
              </span>
            )}
          </CardDescription>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {grow.plants.map((plant) => (
              <motion.div
                key={plant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <PlantCard plant={plant} />
              </motion.div>
            ))}
          </AnimatePresence>
          {grow.plants.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No plants assigned yet
            </div>
          )}
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{stats.comments}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <ChartColumn className="h-4 w-4" />
            <span>{stats.views}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart
              className={`h-4 w-4 ${
                isLiked ? "fill-destructive text-destructive" : ""
              }`}
            />
            <span>{isLiked ? stats.likes + 1 : stats.likes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="p-1">
        <div className="flex w-full justify-between gap-1">
          <Button variant={"destructive"} size={"sm"} className="w-20">
            <Trash2 />
          </Button>
          <Button asChild size={"sm"} className="w-full">
            <Link href={`/grows/${grow.id}/form`}>edit</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

interface PlantCardProps {
  plant: GetOwnPlantType;
}

const growthStages = [
  { name: "seedling", color: "bg-blue-500" },
  { name: "vegetation", color: "bg-green-500" },
  { name: "flowering", color: "bg-purple-500" },
  { name: "harvest", color: "bg-yellow-500" },
  { name: "curing", color: "bg-orange-500" },
];

function determineGrowthStage(plant: GetOwnPlantType) {
  const now = new Date();
  if (plant.curingPhaseStart && now >= plant.curingPhaseStart) return 4;
  if (plant.harvestDate && now >= plant.harvestDate) return 3;
  if (plant.floweringPhaseStart && now >= plant.floweringPhaseStart) return 2;
  if (plant.vegetationPhaseStart && now >= plant.vegetationPhaseStart) return 1;
  if (plant.seedlingPhaseStart && now >= plant.seedlingPhaseStart) return 0;
  return 0; // Default to seedling if no dates are set
}

export function PlantCard({ plant }: PlantCardProps) {
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
                <div className={`h-3 w-3 rounded-full ${color}`} />
              </TooltipTrigger>
              <TooltipContent>
                <p>Growth Stage: {stageName}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Progress value={progress} className="mb-4 h-2" />

          <AnimatePresence>
            <motion.div
              // className="grid grid-cols-2 gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
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
                  <Leaf className="h-4 w-4 text-green-500" />
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
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
