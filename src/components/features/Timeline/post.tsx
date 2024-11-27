"use client";

// src/components/features/Timeline/post.tsx
import {
  AlertCircle,
  Calendar,
  Calendar1,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Sun,
} from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import { api } from "~/lib/trpc/react";
import { formatDate } from "~/lib/utils";
import {
  GetOwnImagesInput,
  GetOwnImagesOutput,
  GetOwnPlantOutput,
  GetOwnPlantsInput,
} from "~/server/api/root";

import PlantCard from "../Plants/plant-card";

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface Grow {
  id: string;
  name: string;
  startDate: Date;
  type: "indoor" | "outdoor";
}

interface Post {
  id: string;
  user: User;
  grow?: Grow;
  plants?: GetOwnPlantOutput[];
  images?: GetOwnImagesOutput;
  createdAt: Date;
  message?: string;
  trigger:
    | "new_grow"
    | "new_plant"
    | "plant_update"
    | "image_upload"
    | "custom";
  likes?: number;
  comments?: number;
  shares?: number;
}

export default function PostComponent({ id }: { id: string }) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleMouseEnter = () => setOpen(true);
  const handleMouseLeave = () => setOpen(false);

  const {
    data: imagesData,
    isLoading: isImagesLoading,
    isFetching: isImagesFetching,
  } = api.image.getOwnImages.useQuery({
    limit: 3,
  } satisfies GetOwnImagesInput);

  const {
    data: plantsData,
    isLoading: isPlantsLoading,
    isFetching: isPlantsFetching,
  } = api.plant.getOwnPlants.useQuery({
    limit: 2,
  } satisfies GetOwnPlantsInput);

  const samplePost = {
    id: "1",
    user: {
      id: "user1",
      name: "Django ElRey 🌱",
      avatar: "/images/XYUV-dwm_400x400.jpg",
    },
    grow: {
      id: "grow1",
      name: "Summer Grow 2023",
      startDate: new Date("2023-06-01"),
      type: "indoor" as const,
    },
    // Move plants and images useMemo into ensure stable reference
    images: useMemo(() => imagesData?.images ?? [], [imagesData]),
    plants: useMemo(() => plantsData?.plants || [], [plantsData]),
    //   {
    //     id: "plant1",
    //     name: "Blue Dream",
    //     createdAt: new Date("2023-06-10"),
    //     updatedAt: new Date("2023-07-01"),
    //     ownerId: "user1",
    //     headerImageId: "img1",
    //     growId: "grow1",
    //     strainId: "strain1", // Assuming you have a strain ID for this plant
    //     startDate: new Date("2023-06-10"),
    //     seedlingPhaseStart: new Date("2023-06-10"),
    //     vegetationPhaseStart: new Date("2023-06-20"),
    //     floweringPhaseStart: new Date("2023-07-01"),
    //     harvestDate: null, // Assuming it hasn't been harvested yet
    //     curingPhaseStart: null, // Assuming it's not yet in the curing phase
    //     plantImages: [
    //       {
    //         image: {
    //           id: "img1",
    //           imageUrl: "/images/IMG_20241005_062601~2.jpg",
    //         },
    //       },
    //     ],
    //     strain: {
    //       id: "strain1",
    //       name: "Blue Dream",
    //       thcContent: 20, // Mock THC content
    //       cbdContent: 0.1, // Mock CBD content
    //       breeder: {
    //         id: "breeder1",
    //         name: "Breeder X",
    //       },
    //     },
    //     headerImage: {
    //       id: "img1",
    //       imageUrl: "/images/IMG_20241005_062601~2.jpg",
    //     },
    //   },
    //   {
    //     id: "plant2",
    //     name: "OG Kush",
    //     createdAt: new Date("2023-07-15"),
    //     updatedAt: new Date("2023-08-01"),
    //     ownerId: "user1",
    //     headerImageId: "img2",
    //     growId: "grow1",
    //     strainId: "strain2", // Assuming you have a strain ID for this plant
    //     startDate: new Date("2023-07-15"),
    //     seedlingPhaseStart: new Date("2023-07-15"),
    //     vegetationPhaseStart: new Date("2023-07-20"),
    //     floweringPhaseStart: new Date("2023-08-01"),
    //     harvestDate: null, // Assuming it hasn't been harvested yet
    //     curingPhaseStart: null, // Assuming it's not yet in the curing phase
    //     plantImages: [
    //       {
    //         image: {
    //           id: "img2",
    //           imageUrl: "/images/IMG_20241020_102123.jpg",
    //         },
    //       },
    //     ],
    //     strain: {
    //       id: "strain2",
    //       name: "OG Kush",
    //       thcContent: 18, // Mock THC content
    //       cbdContent: 0.2, // Mock CBD content
    //       breeder: {
    //         id: "breeder2",
    //         name: "Breeder Y",
    //       },
    //     },
    //     headerImage: {
    //       id: "img2",
    //       imageUrl: "/images/IMG_20241020_102123.jpg",
    //     },
    //   },
    // ],
    createdAt: new Date(),
    trigger: "plant_update",
    message: "yolo",
  };

  const renderTriggerMessage = () => {
    switch (samplePost.trigger) {
      case "new_grow":
        return `${samplePost.user.name} started a new grow: ${samplePost.grow?.name}`;
      case "new_plant":
        return `${samplePost.user.name} added ${samplePost.plants?.length} new plant${
          samplePost.plants!.length > 1 ? "s" : ""
        } to ${samplePost.grow ? `the grow ${samplePost.grow.name}` : "their collection"}`;
      case "plant_update":
        return `${samplePost.user.name} updated ${samplePost.plants?.length} plant${
          samplePost.plants!.length > 1 ? "s" : ""
        }`;
      case "image_upload":
        return `${samplePost.user.name} added ${samplePost.images?.length} new image${
          samplePost.images!.length > 1 ? "s" : ""
        }`;
      default:
        return samplePost.message || "";
    }
  };

  return (
    <div className="border-b border-l border-r border-border p-2 sm:p-3">
      <div className="flex gap-2 sm:gap-3">
        {/* Avatar */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            asChild
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-accent transition-all hover:ring-primary sm:h-11 sm:w-11">
              <AvatarImage
                src={samplePost.user.avatar}
                alt={samplePost.user.name}
              />
              <AvatarFallback>
                {samplePost.user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </PopoverTrigger>
          <PopoverContent
            className="w-64 p-4"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14">
                <AvatarImage
                  src={samplePost.user.avatar}
                  alt={samplePost.user.name}
                />
                <AvatarFallback>
                  {samplePost.user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-lg font-medium">
                  {samplePost.user.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  Member since 2023
                </span>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Post Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-2 flex items-start justify-between">
            <div className="flex flex-row items-center gap-2">
              <span className="font-semibold">{samplePost.user.name}</span>
              <span className="text-accent-foreground">
                @{samplePost.user.id}
              </span>
              <span className="">·</span>
              <span className="text-xs text-muted-foreground sm:text-sm">
                {formatDate(samplePost.createdAt, locale, {
                  month: "short",
                  weekday: "short",
                  includeYear: false,
                })}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="-mt-2">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>

          {/* Message */}
          <p className="mb-3 text-sm">{renderTriggerMessage()}</p>

          {/* Images */}
          {samplePost.images && samplePost.images.length > 0 && (
            <div className="mb-3 overflow-hidden rounded-lg">
              <Carousel className="w-full">
                <CarouselContent>
                  {samplePost.images.map((image, index) => (
                    <CarouselItem key={image.id}>
                      <div className="relative aspect-video w-full md:aspect-square">
                        <Image
                          fill
                          src={image.imageUrl}
                          alt={`Image ${index + 1}`}
                          className="object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious variant={"secondary"} className="left-2" />
                <CarouselNext variant={"secondary"} className="right-2" />
              </Carousel>
            </div>
          )}

          {/* Grow Info */}
          {samplePost.grow && (
            <div className="mb-3 rounded-lg bg-accent p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  {samplePost.grow.name}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  <Sun className="mr-1 h-3 w-3" />
                  {samplePost.grow.type}
                </Badge>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar1 className="h-5 w-5" />
                {formatDate(samplePost.grow.startDate, locale, {
                  includeYear: true,
                })}
              </div>
            </div>
          )}

          {/* Plants Grid */}
          {samplePost.plants && samplePost.plants.length > 0 && (
            <div className="mb-3 grid grid-cols-2 gap-2">
              {samplePost.plants.map((plant) => (
                <PlantCard key={plant.id} plant={plant} />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-6 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0"
              onClick={() => setLiked(!liked)}
            >
              <Heart
                className={`mr-2 h-4 w-4 ${
                  liked ? "fill-current text-red-500" : ""
                }`}
              />
              <span className="text-xs">{0}</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-auto p-0">
              <MessageCircle className="mr-2 h-4 w-4" />
              <span className="text-xs">{0}</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-auto p-0">
              <Share2 className="mr-2 h-4 w-4" />
              <span className="text-xs">{0}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
