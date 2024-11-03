"use client";

import { useIntersection } from "@mantine/hooks";
import { Flower2, Leaf, Loader2, Plus, Sprout, Sun, Wheat } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Link } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import { formatDate } from "~/lib/utils";

export default function PlantsPage() {
  const locale = useLocale();

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } =
    api.plant.getUserPlants.useInfiniteQuery(
      { limit: 9 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const lastPlantRef = useRef<HTMLDivElement>(null);
  const { ref, entry } = useIntersection({
    root: lastPlantRef.current,
    threshold: 1,
  });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage) {
      void fetchNextPage();
    }
  }, [entry, fetchNextPage, hasNextPage]);

  const plants = data?.pages.flatMap((page) => page.plants) ?? [];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Plants</h1>
        <Link href="/plants/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Plant
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plants.map((plant, index) => (
          <Card
            key={plant.id}
            className="overflow-hidden transition-shadow duration-300 hover:shadow-lg"
            ref={index === plants.length - 1 ? ref : undefined}
          >
            <CardHeader className="p-0">
              <div className="relative h-48">
                <Image
                  src={
                    plant.imageUrl ?? "/placeholder.svg?height=200&width=400"
                  }
                  alt={plant.name}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle>{plant.name}</CardTitle>
              <CardDescription>
                Strain: {plant.strain ?? "Unknown"}
              </CardDescription>
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
                <Progress
                  value={plant.growthProgress ?? 40}
                  className="w-full"
                />
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
        ))}
      </div>
      {isFetchingNextPage && (
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
      {!hasNextPage && plants.length > 0 && (
        <p className="mt-8 text-center text-muted-foreground">
          No more plants to load.
        </p>
      )}
      {plants.length === 0 && (
        <p className="mt-8 text-center text-muted-foreground">
          You haven't added any plants yet.
        </p>
      )}
    </div>
  );
}
