"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PaginationItemsPerPage } from "~/assets/constants";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import ItemsPagination from "~/components/atom/item-pagination";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import SpinningLoader from "~/components/atom/spinning-loader";
import { GrowCard } from "~/components/features/Grows/grow-card";
import { useRouter } from "~/lib/i18n/routing";
// Make sure this import path is correct
import type { GetOwnGrowsInput } from "~/server/api/root";
import { useTRPC } from "~/trpc/client";
import { GrowsSortField } from "~/types/grow";

export default function PaginatedGrowsView({
  sortField,
  sortOrder,
  setIsFetchingAction,
}: {
  sortField: GrowsSortField;
  sortOrder: SortOrder;
  setIsFetchingAction: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const trpc = useTRPC();
  const t = useTranslations("Grows");

  // Initialize state from URL query params
  const [currentPage, setCurrentPage] = React.useState(
    parseInt(searchParams?.get("page") || "1"),
  );

  // Function to update URL query params
  const updateUrlParams = React.useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("sortField", sortField);
    params.set("sortOrder", sortOrder);
    router.push(`?${params.toString()}`);
  }, [currentPage, sortField, sortOrder, router]);

  // Sync state with URL query params
  React.useEffect(() => {
    updateUrlParams();
  }, [currentPage, sortField, sortOrder, updateUrlParams]);

  // This is the correct implementation you requested
  const grows = useQuery(
    trpc.grows.getOwnGrows.queryOptions({
      limit: PaginationItemsPerPage.GROWS_PER_PAGE,
      cursor: currentPage,
      sortField,
      sortOrder,
    } satisfies GetOwnGrowsInput),
  );

  // Directly update the parent's isFetching state
  React.useEffect(() => {
    setIsFetchingAction(grows.isFetching);
  }, [grows.isFetching, setIsFetchingAction]);

  const userGrows = grows.data?.grows ?? [];
  const totalPages = grows.data?.totalPages ?? 1;

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      {grows.isLoading ? (
        <SpinningLoader className="text-secondary" />
      ) : userGrows.length === 0 ? (
        <p className="text-muted-foreground mt-8 text-center">
          {t("no-grows-yet")}
        </p>
      ) : (
        <>
          <ResponsiveGrid>
            {userGrows.map((grow) => (
              <GrowCard key={grow.id} grow={grow} isSocial={false} />
            ))}
          </ResponsiveGrid>

          <ItemsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            isFetching={grows.isFetching}
            handlePageChange={handlePageChange}
          />
        </>
      )}
    </>
  );
}
