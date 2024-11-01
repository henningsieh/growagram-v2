"use client";

import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChartColumn,
  Flower2,
  FolderOutput,
  Heart,
  MessageCircle,
  MinusSquare,
  Share,
  User2,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Grow } from "~/components/features/timeline/post";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

interface GrowCardProps {
  grow: Grow;
  onUnassignPlant?: (plantId: string) => void;
  showUnassignButton?: boolean;
  grower?: {
    name: string;
    username: string;
    email: string;
    avatar?: string;
  };
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
    username: "django",
    email: "django@growagram.com",
    avatar: "/images/XYUV-dwm_400x400.jpg",
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
      <CardHeader className="space-y-0 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={grower.avatar} />
              <AvatarFallback>
                <User2 className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-semibold">{grower.name}</p>
              <p className="text-sm text-muted-foreground">
                @{grower.username}
              </p>
            </div>
          </div>
          <Badge
            variant={grow.type === "indoor" ? "default" : "secondary"}
            className="uppercase"
          >
            {grow.type}
          </Badge>
        </div>
      </CardHeader>

      <div
        className="relative aspect-video overflow-hidden"
        onMouseEnter={() => setIsImageHovered(true)}
        onMouseLeave={() => setIsImageHovered(false)}
      >
        <Image
          src="/images/IMG_20241020_102123.jpg?height=400&width=800"
          alt={grow.name}
          className="object-cover transition-transform duration-300"
          style={{
            transform: isImageHovered ? "scale(1.05)" : "scale(1)",
          }}
          width={800}
          height={400}
        />
      </div>

      <CardContent className="space-y-4 pt-4">
        <div>
          <h3 className="text-xl font-bold">{grow.name}</h3>
          <CardDescription>
            <span className="block">
              Started on {format(grow.startDate, "PPP")}
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-primary/40 bg-card text-card-foreground shadow-sm">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Flower2 strokeWidth={0.9} className="h-12 w-12" />
                      <div>
                        <p className="text-base font-semibold">
                          {plant.strain}
                        </p>
                        <Badge variant="secondary" className="uppercase">
                          {plant.growPhase}
                        </Badge>
                      </div>
                    </div>
                    {showUnassignButton && onUnassignPlant && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onUnassignPlant(plant.id)}
                      >
                        <MinusSquare strokeWidth={3} size={14} />
                        Unassign
                      </Button>
                    )}
                  </CardContent>
                </Card>
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
    </Card>
  );
}
