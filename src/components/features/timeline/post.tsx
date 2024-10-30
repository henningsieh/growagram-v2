"use client";

import { format } from "date-fns";
import {
  Calendar,
  Droplet,
  Leaf,
  Scissors,
  Sun,
  TestTubes,
} from "lucide-react";
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
  const [activeTab, setActiveTab] = useState(post.plants[0].id);

  return (
    <Card className="mx-auto my-4 w-full max-w-3xl">
      <CardHeader className="space-y-2 p-4">
        {/* Header with title and avatar */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">{post.grow.name}</h3>
          <Popover>
            <PopoverTrigger asChild>
              <Avatar className="h-12 w-12 cursor-pointer ring-2 ring-transparent transition-all hover:ring-primary">
                <AvatarImage src={post.user.avatar} alt={post.user.name} />
                <AvatarFallback className="text-lg">
                  {post.user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4">
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
                <span className="text-sm text-muted-foreground">
                  Posted {format(post.createdAt, "MMM d, yyyy")}
                </span>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Grow Info */}
        <div className="flex flex-wrap items-center gap-4 p-2 text-sm">
          <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Started {format(post.grow.startDate, "MMM d")}
          </span>
          <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
            <Sun className="h-4 w-4" />
            {post.grow.type}
          </span>
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
        <div className="text-sm leading-relaxed">{post.content}</div>

        <Separator />

        {/* Plant Information */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Plant Informations</h3>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid h-auto min-h-10 w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
              {post.plants.map((plant) => (
                <TabsTrigger
                  key={plant.id}
                  value={plant.id}
                  className="h-10 sm:h-auto"
                >
                  {plant.strain}
                </TabsTrigger>
              ))}
            </TabsList>
            {post.plants.map((plant) => (
              <TabsContent
                key={plant.id}
                value={plant.id}
                className="bg-background p-4 text-sm"
              >
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Strain:</span> {plant.strain}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Growth Phase:</span>{" "}
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
