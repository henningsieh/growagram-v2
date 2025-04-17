// src/app/[locale]/(protected)/dashboard/page.tsx:
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { PaginationItemsPerPage } from "~/assets/constants";
import { BreadcrumbSetter } from "~/components/Layouts/Breadcrumbs/breadcrumb-setter";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { DashboardContent } from "~/components/features/Dashboard/dashboard-content";
import { createBreadcrumbs } from "~/lib/breadcrumbs/breadcrumbs";
import { getQueryClient, trpc } from "~/lib/trpc/server";
import { GrowsSortField } from "~/types/grow";
import { PlantsSortField } from "~/types/plant";

export const metadata = {
  title: "Grower's Plattform",
  description: "Grower's Plattform",
};

export default function Dashboard() {
  // For the dashboard page, we pass an empty array to get just the dashboard breadcrumb marked as current
  const breadcrumbs = createBreadcrumbs([]);

  // Prefetch all dashboard queries on the server
  const queryClient = getQueryClient();

  // Be explicit with all parameters - match EXACTLY what the router uses as defaults
  void queryClient.prefetchQuery(
    trpc.grows.getOwnGrows.queryOptions({
      cursor: 1,
      limit: PaginationItemsPerPage.GROWS_PER_PAGE,
      sortField: GrowsSortField.CREATED_AT,
      sortOrder: SortOrder.DESC,
    }),
  );

  void queryClient.prefetchQuery(
    trpc.plants.getOwnPlants.queryOptions({
      cursor: 1,
      limit: PaginationItemsPerPage.PLANTS_PER_PAGE,
      sortField: PlantsSortField.CREATED_AT,
      sortOrder: SortOrder.DESC,
    }),
  );

  void queryClient.prefetchQuery(
    trpc.photos.getOwnPhotos.queryOptions({
      limit: 12,
    }),
  );
  // Optionally prefetch user profile if you have access to user id here

  return (
    <>
      <BreadcrumbSetter items={breadcrumbs} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DashboardContent />
      </HydrationBoundary>
    </>
  );
}
