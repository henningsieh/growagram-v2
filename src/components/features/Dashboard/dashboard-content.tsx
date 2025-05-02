"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { skipToken, useQuery } from "@tanstack/react-query";
import {
  Flower2Icon,
  ImageIcon,
  TentTree,
  UsersIcon,
  Wheat,
} from "lucide-react";
import { PaginationItemsPerPage } from "~/assets/constants";
import PageHeader from "~/components/Layouts/page-header";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { ActivePlantsCard } from "~/components/features/Dashboard/active-plants-card";
import { PlantsOverviewChart } from "~/components/features/Dashboard/dashboard-overview-chart";
import { RecentPhotosWidget } from "~/components/features/Dashboard/recent-photos-widget";
import { DashboardNotificationsFeed } from "~/components/features/Notifications/dashboard-notifications-feed";
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
import { useTRPC } from "~/trpc/client";
import { GrowsSortField } from "~/types/grow";
import { PlantsSortField } from "~/types/plant";

export function DashboardContent() {
  const t = useTranslations("Platform");
  const [activeTab, setActiveTab] = React.useState("overview");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const trpc = useTRPC();

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
  }, [pathname, searchParams]);

  // Use tRPC hooks with TanStack React Query
  const growsQuery = useQuery(
    trpc.grows.getOwnGrows.queryOptions({
      cursor: 1,
      limit: PaginationItemsPerPage.GROWS_PER_PAGE,
      sortField: GrowsSortField.CREATED_AT,
      sortOrder: SortOrder.DESC,
    }),
  );

  const plantsQuery = useQuery(
    trpc.plants.getOwnPlants.queryOptions({
      cursor: 1,
      limit: PaginationItemsPerPage.PLANTS_PER_PAGE,
      sortField: PlantsSortField.CREATED_AT,
      sortOrder: SortOrder.DESC,
    }),
  );

  const photosQuery = useQuery(
    trpc.photos.getOwnPhotos.queryOptions({ limit: 12 }),
  );

  const userProfileQuery = useQuery({
    ...trpc.users.getPublicUserProfile.queryOptions(
      session?.user.id ? { id: session.user.id } : skipToken,
    ),
    enabled: !!session?.user.id,
  });

  // Return null if session is null, after defining all hooks
  if (session === null) {
    return null;
  }

  const growsData = growsQuery.data;
  const plantsData = plantsQuery.data;
  const photosData = photosQuery.data;
  const userProfile = userProfileQuery.data;
  const isLoadingGrows = growsQuery.isLoading;
  const isLoadingPlants = plantsQuery.isLoading;
  const isLoadingPhotos = photosQuery.isLoading;
  const userStatsArePending = userProfileQuery.isPending;

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
        <div className="flex-1 space-y-4 pt-6 pb-2">
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
                // className="dark:data-[state=active]:bg-background"
                value="overview"
              >
                {t("overview")}
              </TabsTrigger>
              <TabsTrigger value="activity">{t("activity")}</TabsTrigger>
              <TabsTrigger value="analytics">{t("analytics")}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Summary Cards */}
              <div className="xs:grid-cols-2 grid gap-4 lg:grid-cols-4">
                {/* Grows Card */}
                <Card className="gap-2">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle as="h2" className="text-2xl font-semibold">
                      {t("grow-environments")}
                    </CardTitle>
                    <TentTree className="size-5 shrink-0" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    {isLoadingGrows ? (
                      <Skeleton className="h-9 w-20" />
                    ) : (
                      <div className="text-3xl font-bold">{totalGrows}</div>
                    )}
                  </CardContent>
                  <CardFooter className="text-muted-foreground text-xs">
                    {t("grow-environments-description")}
                  </CardFooter>
                </Card>

                {/* Plants Card */}
                <Card className="gap-2">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle as="h2" className="text-2xl font-semibold">
                      {t("total-plants")}
                    </CardTitle>
                    <Flower2Icon className="size-5 shrink-0" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    {isLoadingPlants ? (
                      <Skeleton className="h-9 w-20" />
                    ) : (
                      <div className="text-3xl font-bold">{totalPlants}</div>
                    )}
                  </CardContent>
                  <CardFooter className="text-muted-foreground text-xs">
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
                <Card className="gap-2">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle as="h2" className="text-2xl font-semibold">
                      {t("total-photos")}
                    </CardTitle>
                    <ImageIcon className="size-5 shrink-0" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    {isLoadingPhotos ? (
                      <Skeleton className="h-9 w-20" />
                    ) : (
                      <div className="text-3xl font-bold">{totalPhotos}</div>
                    )}
                  </CardContent>
                  <CardFooter className="text-muted-foreground text-xs">
                    {t("total-photos-description")}
                  </CardFooter>
                </Card>

                {/* User Stats Card */}
                <Card className="gap-2">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle as="h2" className="text-2xl font-semibold">
                      {t("comunity")}
                    </CardTitle>
                    <UsersIcon className="size-5 shrink-0" />
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
                      <div className="space-y-4">
                        <div className="text-3xl font-bold">
                          {userStatsArePending ? (
                            <Skeleton className="h-9 w-11" />
                          ) : (
                            followerCount
                          )}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {t("Followers")}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="text-3xl font-bold">
                          {userStatsArePending ? (
                            <Skeleton className="h-9 w-11" />
                          ) : (
                            followingCount
                          )}
                        </div>
                        <div className="text-muted-foreground text-xs whitespace-nowrap">
                          {t("Following")}
                        </div>
                      </div>
                    </div>
                    {/*  */}
                  </CardContent>
                </Card>
              </div>

              {/* 2nd row */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-8">
                {/* Active Plants Card */}
                <ActivePlantsCard
                  plantsData={plantsData}
                  isLoading={isLoadingPlants}
                />

                <RecentPhotosWidget
                  photos={photosData?.images}
                  isLoading={isLoadingPhotos}
                />
              </div>
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
                    {/* Conditionally render the component directly */}
                    {activeTab === "activity" ? (
                      <DashboardNotificationsFeed />
                    ) : (
                      // Optional: Render a placeholder or nothing when inactive
                      <div className="bg-muted/20 h-96 animate-pulse rounded-md" />
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
                      <Wheat className="text-muted-foreground mx-auto h-8 w-8" />
                      <h3 className="font-medium">
                        {t("analytics-coming-soon")}
                      </h3>
                      <p className="text-muted-foreground text-sm">
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
