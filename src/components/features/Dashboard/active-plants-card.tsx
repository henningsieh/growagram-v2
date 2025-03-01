"use client";

import { Sprout } from "lucide-react";
import { useTranslations } from "next-intl";
import { EnhancedPlantCard } from "~/components/features/Plants/enhanced-plant-card";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Link } from "~/lib/i18n/routing";
import type { GetOwnPlantsType } from "~/server/api/root";

interface ActivePlantsCardProps {
  plantsData?: {
    plants: GetOwnPlantsType;
    count?: number;
  };
  isLoading: boolean;
}

export function ActivePlantsCard({
  plantsData,
  isLoading,
}: ActivePlantsCardProps) {
  const t = useTranslations("Platform");

  const activePlants =
    plantsData?.plants.filter(
      (plant) => !plant.harvestDate && !plant.curingPhaseStart,
    ) || [];

  return (
    <Card className="col-span-4 sm:col-span-3">
      <CardHeader>
        <CardTitle>{t("active-plants")}</CardTitle>
        <CardDescription>{t("active-plants-description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {isLoading
            ? Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="ml-4 space-y-1">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[160px]" />
                    </div>
                  </div>
                ))
            : [...activePlants]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((plant) => (
                  <EnhancedPlantCard key={plant.id} plant={plant} />
                ))}

          {!isLoading &&
            (!plantsData?.plants.length || activePlants.length === 0) && (
              <div className="py-4 text-center text-muted-foreground">
                <Sprout className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>{t("no-active-plants")}</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/plants/form">{t("create-plant")}</Link>
                </Button>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
