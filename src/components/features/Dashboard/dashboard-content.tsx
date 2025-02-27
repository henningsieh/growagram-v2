"use client";

import {
  CalendarDays,
  CameraIcon,
  TagIcon,
  TentTree,
  Wheat,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import PageHeader from "~/components/Layouts/page-header";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/lib/trpc/react";

import { ActivePlantsCard } from "./active-plants-card";
import { DashboardActivityFeed } from "./dashboard-activity-feed";
import { DashboardOverviewChart } from "./dashboard-overview-chart";
import { RecentPhotosWidget } from "./recent-photos-widget";
import { UserStatsCard } from "./user-stats-card";

export function DashboardContent() {
  const { data: session, status } = useSession();
  const t = useTranslations("Platform");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: plantsData, isLoading: isLoadingPlants } =
    api.plants.getOwnPlants.useQuery({
      // limit: 5,
    });

  const { data: growsData, isLoading: isLoadingGrows } =
    api.grows.getOwnGrows.useQuery({
      // limit: 6,
    });

  const { data: photosData, isLoading: isLoadingPhotos } =
    api.photos.getOwnPhotos.useQuery({
      limit: 6,
    });

  if (!session?.user) return null;

  const totalPlants = plantsData?.count || 0;
  const totalGrows = growsData?.count || 0;
  const totalPhotos = photosData?.count || 0;

  const activePlants =
    plantsData?.plants.filter(
      (plant) => !plant.harvestDate && !plant.curingPhaseStart,
    ).length || 0;

  const harvestedPlants =
    plantsData?.plants.filter(
      (plant) => plant.harvestDate || plant.curingPhaseStart,
    ).length || 0;

  return (
    <>
      <PageHeader
        title={t("Dashboard-title")}
        subtitle={t("welcome-to-platform-subttitle")}
      >
        <div className="flex-1 space-y-4 pb-2 pt-6">
          <Tabs
            defaultValue="overview"
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="mb-4 sm:mb-0">
              <TabsTrigger
                className="text-base font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                value="overview"
              >
                {t("overview")}
              </TabsTrigger>
              <TabsTrigger
                className="text-base font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                value="analytics"
              >
                {t("analytics")}
              </TabsTrigger>
              <TabsTrigger
                className="text-base font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                value="activity"
              >
                {t("activity")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Summary Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Grows Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-semibold">
                      {t("grow-environments")}
                    </CardTitle>
                    <TentTree className="ml-2 size-4 text-secondary" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    {isLoadingGrows ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="text-2xl font-bold">{totalGrows}</div>
                    )}
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground">
                    {t("grow-environments-description")}
                  </CardFooter>
                </Card>

                {/* Plants Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-semibold">
                      {t("total-plants")}
                    </CardTitle>
                    <TagIcon className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    {isLoadingPlants ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="text-2xl font-bold">{totalPlants}</div>
                    )}
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground">
                    {isLoadingPlants ? (
                      <>
                        <Skeleton className="mr-2 h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                      </>
                    ) : (
                      <>
                        {activePlants} {t("living")}, {harvestedPlants}{" "}
                        {t("harvested")}
                      </>
                    )}
                  </CardFooter>
                </Card>

                {/* Photos Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-semibold">
                      {t("total-photos")}
                    </CardTitle>
                    <CameraIcon className="h-4 w-4 text-foreground" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    {isLoadingPhotos ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="text-2xl font-bold">{totalPhotos}</div>
                    )}
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground">
                    {t("total-photos-description")}
                  </CardFooter>
                </Card>

                {/* User Stats Card */}
                <UserStatsCard userId={session.user.id} />
              </div>

              {/* 2nd row */}
              <div className="grid gap-0 space-y-4 sm:grid-cols-2 lg:grid-cols-7 lg:gap-4 lg:space-y-0">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>{t("recent-photos")}</CardTitle>
                    <CardDescription>
                      {t("recent-photos-description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentPhotosWidget
                      photos={photosData?.images}
                      isLoading={isLoadingPhotos}
                    />
                  </CardContent>
                </Card>

                {/* Active Plants Card */}
                <ActivePlantsCard
                  plantsData={plantsData}
                  isLoading={isLoadingPlants}
                />
              </div>

              {/* Recent Photos and Activity Feed */}
              {/* <div className="grid gap-0 space-y-4 sm:grid-cols-2 lg:grid-cols-7 lg:gap-4 lg:space-y-0">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>{t("recent-photos")}</CardTitle>
                    <CardDescription>
                      {t("recent-photos-description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentPhotosWidget
                      photos={photosData?.images}
                      isLoading={isLoadingPhotos}
                    />
                  </CardContent>
                </Card>

                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>{t("recent-activity")}</CardTitle>
                    <CardDescription>
                      {t("recent-activity-description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DashboardActivityFeed />
                  </CardContent>
                </Card>
              </div> */}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("detailed-analytics")}</CardTitle>
                  <CardDescription>
                    {t("analytics-description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="flex h-[300px] items-center justify-center rounded-md border-2 border-dashed">
                    <div className="space-y-2 text-center">
                      <Wheat className="mx-auto h-8 w-8 text-muted-foreground" />
                      <h3 className="font-medium">
                        {t("analytics-coming-soon")}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t("analytics-coming-soon-description")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Growth Chart */}
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>{t("growth-overview")}</CardTitle>
                  <CardDescription>
                    {t("growth-chart-description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <DashboardOverviewChart plantsData={plantsData?.plants} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("all-activity")}</CardTitle>
                  <CardDescription>
                    {t("all-activity-description")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <DashboardActivityFeed
                      // userId={session.user.id}
                      limit={10}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageHeader>
    </>
  );
}
