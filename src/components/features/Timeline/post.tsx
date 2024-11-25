"use client";

import {
  AlertCircle,
  Calendar,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Sun,
} from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
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
import { formatDate } from "~/lib/utils";
import { GetOwnImagesOutput, GetOwnPlantsOutput } from "~/server/api/root";

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

interface Plant {
  id: string;
  name: string;
  strain: string;
  growPhase: string;
}

interface Image {
  id: string;
  url: string;
  captureDate: Date;
}

interface Post {
  id: string;
  user: User;
  grow?: Grow;
  plants?: Plant[];
  images?: Image[];
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

export default function PostComponent({ post }: { post: Post }) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleMouseEnter = () => setOpen(true);
  const handleMouseLeave = () => setOpen(false);

  const renderTriggerMessage = () => {
    switch (post.trigger) {
      case "new_grow":
        return `${post.user.name} started a new grow: ${post.grow?.name}`;
      case "new_plant":
        return `${post.user.name} added ${post.plants?.length} new plant${post.plants!.length > 1 ? "s" : ""} to ${post.grow ? `the grow ${post.grow.name}` : "their collection"}`;
      case "plant_update":
        return `${post.user.name} updated ${post.plants?.length} plant${post.plants!.length > 1 ? "s" : ""}`;
      case "image_upload":
        return `${post.user.name} added ${post.images?.length} new image${post.images!.length > 1 ? "s" : ""}`;
      default:
        return post.message || "";
    }
  };

  return (
    <Card className="space-y-2 overflow-hidden rounded-none p-4">
      <div className="flex items-center gap-4 pl-0">
        {/* the following 3 elements must be in a horizontal row! */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            asChild
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Avatar className="h-16 w-16 cursor-pointer ring-2 ring-transparent transition-all hover:ring-primary">
              <AvatarImage src={post.user.avatar} alt={post.user.name} />
              <AvatarFallback>
                {post.user.name.slice(0, 2).toUpperCase()}
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
                <AvatarImage src={post.user.avatar} alt={post.user.name} />
                <AvatarFallback>
                  {post.user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-lg font-medium">{post.user.name}</span>
                <span className="text-sm text-muted-foreground">
                  Member since 2023
                </span>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex w-full items-start justify-between">
          <div className="flex flex-col">
            <span className="font-semibold">{post.user.name}</span>
            <span className="text-sm text-muted-foreground">
              {formatDate(post.createdAt, locale, {
                month: "short",
                weekday: "short",
                includeYear: true,
              })}
            </span>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="flex gap-4 pl-20">
        <div className="w-full">
          <Card className="flex-grow">
            <CardHeader className="m-1 rounded-sm bg-accent">
              <CardTitle className="flex w-full items-center gap-2">
                <AlertCircle className="h-10 w-10" />
                <p className="p-0">{renderTriggerMessage()}</p>
              </CardTitle>
            </CardHeader>

            {post.images && post.images.length > 0 && (
              <Carousel className="w-full">
                <CarouselContent>
                  {post.images.map((image, index) => (
                    <CarouselItem key={image.id}>
                      <div className="relative aspect-video w-full overflow-hidden">
                        <Image
                          fill={true}
                          src={image.url}
                          alt={`Image ${index + 1}`}
                          className="object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            )}

            {post.grow && (
              <div className="border-t p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{post.grow.name}</h3>
                  <Badge>
                    <span className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      {post.grow.type}
                    </span>
                  </Badge>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDate(post.grow.startDate, locale, {
                    includeYear: true,
                  })}
                </div>
              </div>
            )}

            {post.plants && post.plants.length > 0 && (
              <>
                <Separator />
                <div className="p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {post.plants.map((plant) => (
                      <PlantCard key={plant.id} plant={plant} />
                      // <div
                      //   key={plant.id}
                      //   className="rounded-lg bg-muted p-3 text-sm"
                      // >
                      //   <p className="font-bold">{plant.name}</p>
                      //   <p>Strain: {plant.strain}</p>
                      //   <p>Growth Phase: {plant.growPhase}</p>
                      // </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="border-t p-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setLiked(!liked)}
                  >
                    <Heart
                      className={`h-5 w-5 ${liked ? "fill-current text-red-500" : ""}`}
                    />
                    <span>{post.likes || 0}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>{post.comments || 0}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-5 w-5" />
                    <span>{post.shares || 0}</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Card>
  );
}
