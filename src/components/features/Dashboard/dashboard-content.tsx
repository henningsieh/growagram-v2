"use client";

import {
  Flower2Icon,
  ImageIcon,
  TentTree,
  UsersIcon,
  Wheat,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import * as React from "react";
import PageHeader from "~/components/Layouts/page-header";
import { NotificationsFeed } from "~/components/features/Notifications/notifications-feed";
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
import { PlantsOverviewChart } from "./dashboard-overview-chart";
import { RecentPhotosWidget } from "./recent-photos-widget";

export function DashboardContent() {
  const t = useTranslations("Platform");
  const [activeTab, setActiveTab] = React.useState("overview");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Handle URL hash for tab selection
  React.useEffect(() => {
    // Function to handle hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash === "activity" || hash === "analytics" || hash === "overview") {
        setActiveTab(hash);
      }
    };

    // Check hash on initial load
    handleHashChange();

    // Listen for hash changes from regular navigation
    window.addEventListener("hashchange", handleHashChange);

    // Also check hash whenever pathname or searchParams change
    // This catches Next.js client-side navigation changes
    handleHashChange();

    // Clean up event listener
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [pathname, searchParams]); // Add pathname and searchParams as dependencies

  if (session === null) {
    return null;
  }

  const { data: growsData, isLoading: isLoadingGrows } =
    api.grows.getOwnGrows.useQuery({
      // limit: 6,
    });

  const { data: plantsData, isLoading: isLoadingPlants } =
    api.plants.getOwnPlants.useQuery({
      // limit: 5,
    });

  const { data: photosData, isLoading: isLoadingPhotos } =
    api.photos.getOwnPhotos.useQuery({
      limit: 6,
    });

  const { data: userProfile, isPending: userStatsArePending } =
    api.users.getPublicUserProfile.useQuery(
      { id: session?.user.id },
      { enabled: status === "authenticated" },
    );

  const totalGrows = growsData?.count || 0;
  const totalPlants = plantsData?.count || 0;
  const totalPhotos = photosData?.count || 0;
  const followerCount = userProfile?.followers.length || 0;
  const followingCount = userProfile?.following.length || 0;

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
            onValueChange={(value) => {
              setActiveTab(value);
              // Update URL hash without full page reload
              window.history.replaceState(null, "", `#${value}`);
            }}
            className="space-y-4"
          >
            <TabsList className="mb-4 w-full font-bold sm:mb-0">
              <TabsTrigger
                // className="text-base font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                className="w-full data-[state=active]:font-bold"
                value="overview"
              >
                {t("overview")}
              </TabsTrigger>
              <TabsTrigger
                // className="text-base font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                className="w-full data-[state=active]:font-bold"
                value="activity"
              >
                {t("activity")}
              </TabsTrigger>
              <TabsTrigger
                // className="text-base font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                className="w-full data-[state=active]:font-bold"
                value="analytics"
              >
                {t("analytics")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Summary Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Grows Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle as="h2">{t("grow-environments")}</CardTitle>
                    <TentTree className="size-5" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    {isLoadingGrows ? (
                      <Skeleton className="h-9 w-20" />
                    ) : (
                      <div className="text-3xl font-bold">{totalGrows}</div>
                    )}
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground">
                    {t("grow-environments-description")}
                  </CardFooter>
                </Card>

                {/* Plants Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle as="h2">{t("total-plants")}</CardTitle>
                    <Flower2Icon className="size-5" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    {isLoadingPlants ? (
                      <Skeleton className="h-9 w-20" />
                    ) : (
                      <div className="text-3xl font-bold">{totalPlants}</div>
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
                        {activePlants} {t("living")}
                        {", "}
                        {harvestedPlants} {t("harvested")}
                      </>
                    )}
                  </CardFooter>
                </Card>

                {/* Photos Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle as="h2">{t("total-photos")}</CardTitle>
                    <ImageIcon className="size-5" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    {isLoadingPhotos ? (
                      <Skeleton className="h-9 w-20" />
                    ) : (
                      <div className="text-3xl font-bold">{totalPhotos}</div>
                    )}
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground">
                    {t("total-photos-description")}
                  </CardFooter>
                </Card>

                {/* User Stats Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle as="h2">{t("comunity")}</CardTitle>
                    <UsersIcon className="size-5" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* <div className="flex items-center space-x-3">
                          <CustomAvatar
                            size={36}
                            src={user.image || undefined}
                            alt={user.name || "User avatar"}
                            fallback="User2"
                          />
                          <div>
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-xs text-muted-foreground">
                              @{user.username}
                            </div>
                          </div>
                        </div> */}
                    <div className="flex space-x-8">
                      <div className="space-y-2">
                        <div className="text-3xl font-bold">
                          {userStatsArePending ? (
                            <Skeleton className="h-9 w-11" />
                          ) : (
                            followerCount
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t("Followers")}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-3xl font-bold">
                          {userStatsArePending ? (
                            <Skeleton className="h-9 w-11" />
                          ) : (
                            followingCount
                          )}
                        </div>
                        <div className="whitespace-nowrap text-xs text-muted-foreground">
                          {t("Following")}
                        </div>
                      </div>
                    </div>
                    {/*  */}
                  </CardContent>
                </Card>
              </div>

              {/* 2nd row */}
              <div className="grid gap-0 space-y-4 sm:grid-cols-3 lg:grid-cols-7 lg:gap-4 lg:space-y-0">
                {/* Active Plants Card */}
                <ActivePlantsCard
                  plantsData={plantsData}
                  isLoading={isLoadingPlants}
                />

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
                    {/* Use a state to control mounting */}
                    {activeTab === "activity" && (
                      <React.Suspense
                        fallback={
                          <div className="h-96 animate-pulse rounded-md bg-muted/20" />
                        }
                      >
                        <NotificationsFeed />
                      </React.Suspense>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("detailed-statistics")}</CardTitle>
                  <CardDescription>
                    {t("detailed-analytics-description")}
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
                  <CardTitle>{t("analytics-growth-overview")}</CardTitle>
                  <CardDescription>
                    {t("analytics-growth-chart-description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <PlantsOverviewChart plantsData={plantsData?.plants} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageHeader>
    </>
  );
}
