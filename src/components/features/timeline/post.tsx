"use client";

import { format } from "date-fns";
import { Droplet, Leaf, Scissors, TestTubes } from "lucide-react";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
}

interface Post {
  id: string;
  grow: Grow;
  plants: Plant[];
  createdAt: Date;
  feeding: boolean;
  watering: boolean;
  pruning: boolean;
}

export default function PostComponent({ post }: { post: Post }) {
  const [activeTab, setActiveTab] = useState(post.plants[0].id);

  return (
    <Card className="mx-auto my-4 w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{post.grow.name}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {format(post.createdAt, "PPP")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="mb-2 text-lg font-semibold">Grow Information</h3>
          <p>Start Date: {format(post.grow.startDate, "PPP")}</p>
        </div>
        <div className="mb-4">
          <h3 className="mb-2 text-lg font-semibold">Plant Information</h3>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              {post.plants.map((plant) => (
                <TabsTrigger key={plant.id} value={plant.id}>
                  {plant.strain}
                </TabsTrigger>
              ))}
            </TabsList>
            {post.plants.map((plant) => (
              <TabsContent key={plant.id} value={plant.id}>
                <div className="space-y-2">
                  <p>Strain: {plant.strain}</p>
                  <p>Growth Phase: {plant.growPhase}</p>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex space-x-2">
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
