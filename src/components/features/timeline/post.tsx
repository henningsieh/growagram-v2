"use client";

import {
  Calendar1,
  Droplet,
  Leaf,
  Scissors,
  Sun,
  TestTubes,
} from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { formatDate } from "~/lib/utils";

interface Plant {
  id: string;
  strain: string;
  growPhase: string;
}

interface Grow {
  id: string;
  name: string;
  startDate: Date;
  type: "indoor" | "outdoor";
}

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface Post {
  id: string;
  user: User;
  grow: Grow;
  plants: Plant[];
  createdAt: Date;
  content: string;
  images: string[];
  feeding: boolean;
  watering: boolean;
  pruning: boolean;
}

export default function PostComponent({ post }: { post: Post }) {
  const locale = useLocale(); // Get the current locale

  const [activeTab, setActiveTab] = useState(post.plants[0].id);
  const [open, setOpen] = useState(false);

  const handleMouseEnter = () => {
    setOpen(true);
  };

  const handleMouseLeave = () => {
    setOpen(false);
  };

  return (
    <Card className="mx-auto my-4 w-full max-w-3xl">
      <CardHeader className="space-y-4 p-4">
        {/* Header with title and avatar */}
        <div className="flex items-center justify-between">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              asChild
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-transparent transition-all hover:ring-primary">
                <AvatarImage src={post.user.avatar} alt={post.user.name} />
                <AvatarFallback className="text-lg">
                  {post.user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent
              className="w-64 p-4"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={post.user.avatar} alt={post.user.name} />
                    <AvatarFallback className="text-xl">
                      {post.user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-lg font-medium">
                      {post.user.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Member since 2023
                    </span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <h3 className="text-xl font-semibold">{post.grow.name}</h3>
        </div>

        {/* Grow Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-2 text-sm">
          <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
            <Calendar1 className="h-4 w-4" />
            {/* {post.grow.startDate.toLocaleDateString(locale)} */}
            {formatDate(post.grow.startDate, locale, {
              // weekday: "short",
              // month: "2-digit",
              includeYear: true,
            })}
          </span>
          <Badge>
            <span className="flex items-center gap-2 font-medium">
              <Sun className="h-4 w-4" />
              {post.grow.type}
            </span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Image Carousel */}
        <Carousel className="w-full">
          <CarouselContent>
            {post.images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    fill={true}
                    src={image}
                    alt={`Grow update ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>

        {/* Post Content */}
        <div className="rounded-sm bg-muted p-2 text-base font-light leading-relaxed">
          {post.content}
        </div>

        <Separator />

        {/* Plant Information */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Plant Informations</h3>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-3 md:grid-cols-4">
              {post.plants.map((plant) => (
                <TabsTrigger key={plant.id} value={plant.id} className="h-8">
                  {plant.strain}
                </TabsTrigger>
              ))}
            </TabsList>
            {post.plants.map((plant) => (
              <TabsContent
                key={plant.id}
                value={plant.id}
                className="bg-muted p-4 text-sm"
              >
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <span className="font-bold">Strain:</span> {plant.strain}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Growth Phase:</span>{" "}
                    {plant.growPhase}
                  </p>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CardContent>

      <CardFooter className="mt-4 flex items-center justify-between border-t py-4">
        <div className="flex flex-wrap gap-2">
          {post.feeding && (
            <Badge variant="secondary" className="text-sm">
              <TestTubes className="mr-1.5 h-4 w-4" />
              Feeding
            </Badge>
          )}
          {post.watering && (
            <Badge variant="secondary" className="text-sm">
              <Droplet className="mr-1.5 h-4 w-4" />
              Watering
            </Badge>
          )}
          {post.pruning && (
            <Badge variant="secondary" className="text-sm">
              <Scissors className="mr-1.5 h-4 w-4" />
              Pruning
            </Badge>
          )}
        </div>
        <Badge variant="outline" className="text-sm">
          <Leaf className="mr-1.5 h-4 w-4" />
          {post.plants.length} Plant{post.plants.length > 1 ? "s" : ""}
        </Badge>
      </CardFooter>
    </Card>
  );
}
