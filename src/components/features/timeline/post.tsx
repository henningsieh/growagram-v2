"use client";

import { format } from "date-fns";
import {
  Calendar,
  Droplet,
  Home,
  Leaf,
  Scissors,
  ScrollText,
  Sun,
  TestTubes,
  User,
} from "lucide-react";
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
      <CardHeader className="space-y-6">
        <div className="flex flex-col space-y-6 sm:flex-row sm:justify-between sm:space-y-0">
          {/* User Information */}
          <div className="flex items-start space-x-4">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={post.user.avatar} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                {post.user.name}
              </p>
              <p className="flex items-center text-sm text-muted-foreground">
                <ScrollText className="mr-1 h-3.5 w-3.5" />
                {format(post.createdAt, "PPP")}
              </p>
            </div>
          </div>

          {/* Grow Information */}
          <div className="flex items-start space-x-4 sm:text-right">
            <div className="flex-1 space-y-1">
              <p className="text-base font-semibold leading-none">
                {post.grow.name}
              </p>
              <div className="flex items-center justify-end space-x-4 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Calendar className="mr-1 h-3.5 w-3.5" />
                  Started {format(post.grow.startDate, "MMM d, yyyy")}
                </span>
                <span className="flex items-center">
                  {post.grow.type === "indoor" ? (
                    <Home className="mr-1 h-3.5 w-3.5" />
                  ) : (
                    <Sun className="mr-1 h-3.5 w-3.5" />
                  )}
                  {post.grow.type === "indoor" ? "Indoor" : "Outdoor"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Image Carousel */}
        <Carousel className="w-full">
          <CarouselContent>
            {post.images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="aspect-video w-full overflow-hidden rounded-lg">
                  <img
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
        <div className="text-sm">{post.content}</div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Plant Information</h3>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList>
              {post.plants.map((plant) => (
                <TabsTrigger key={plant.id} value={plant.id}>
                  {plant.strain}
                </TabsTrigger>
              ))}
            </TabsList>
            {post.plants.map((plant) => (
              <TabsContent
                key={plant.id}
                value={plant.id}
                className="p-2 text-sm"
              >
                <div className="space-y-2">
                  <p>Strain: {plant.strain}</p>
                  <p>Growth Phase: {plant.growPhase}</p>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CardContent>

      <CardFooter className="mt-4 flex items-center justify-between border-t py-4">
        <div className="flex flex-wrap gap-2">
          {post.feeding && (
            <Badge variant="secondary">
              <TestTubes className="mr-1 h-4 w-4" />
              Feeding
            </Badge>
          )}
          {post.watering && (
            <Badge variant="secondary">
              <Droplet className="mr-1 h-4 w-4" />
              Watering
            </Badge>
          )}
          {post.pruning && (
            <Badge variant="secondary">
              <Scissors className="mr-1 h-4 w-4" />
              Pruning
            </Badge>
          )}
        </div>
        <Badge variant="outline">
          <Leaf className="mr-1 h-4 w-4" />
          {post.plants.length} Plant{post.plants.length > 1 ? "s" : ""}
        </Badge>
      </CardFooter>
    </Card>
  );
}
