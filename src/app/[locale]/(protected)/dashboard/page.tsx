// src/app/[locale]/(protected)/dashboard/page.tsx:
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { BreadcrumbSetter } from "~/components/Layouts/Breadcrumbs/breadcrumb-setter";
import { DashboardContent } from "~/components/features/Dashboard/dashboard-content";
import { createBreadcrumbs } from "~/lib/breadcrumbs";
import { getQueryClient, trpc } from "~/trpc/server";

export const metadata = {
  title: "Grower's Plattform",
  description: "Grower's Plattform",
};

export default function Dashboard() {
  // For the dashboard page, we pass an empty array to get just the dashboard breadcrumb marked as current
  const breadcrumbs = createBreadcrumbs([]);

  // Prefetch all dashboard queries on the server
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.grows.getOwnGrows.queryOptions({}));
  void queryClient.prefetchQuery(trpc.plants.getOwnPlants.queryOptions({}));
  void queryClient.prefetchQuery(
    trpc.photos.getOwnPhotos.queryOptions({ limit: 12 }),
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
