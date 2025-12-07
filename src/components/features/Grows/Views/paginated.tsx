"use client";

import * as React from "react";

// src/components/features/Grows/Views/paginated.tsx:
import { useSearchParams } from "next/navigation";

import { useTranslations } from "next-intl";

import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import ItemsPagination from "~/components/atom/item-pagination";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import SpinningLoader from "~/components/atom/spinning-loader";
import { GrowCard } from "~/components/features/Grows/grow-card";

import type { GetOwnGrowsInput } from "~/server/api/root";

import { GrowsSortField } from "~/types/grow";

import { useRouter } from "~/lib/i18n/routing";
import { useTRPC } from "~/lib/trpc/client";

import { PaginationItemsPerPage } from "~/assets/constants";

export default function PaginatedGrowsView({
  sortField,
  sortOrder,
  setIsFetching,
}: {
  sortField: GrowsSortField;
  sortOrder: SortOrder;
  setIsFetching: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const trpc = useTRPC();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
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

  // Get initial data from cache
  const initialData = queryClient.getQueryData(
    trpc.grows.getOwnGrows.queryKey({
      cursor: currentPage,
      limit: PaginationItemsPerPage.GROWS_PER_PAGE,
      sortField,
      sortOrder,
    } satisfies GetOwnGrowsInput),
  );

  // Query grows
  const { data, isLoading, isFetching } = useQuery(
    trpc.grows.getOwnGrows.queryOptions(
      {
        limit: PaginationItemsPerPage.GROWS_PER_PAGE,
        cursor: currentPage,
        sortField,
        sortOrder,
      } satisfies GetOwnGrowsInput,
      {
        initialData,
      },
    ),
  );

  // Directly update the parent's isFetching state
  React.useEffect(() => {
    setIsFetching(isFetching);
  }, [isFetching, setIsFetching]);

  const userGrows = data?.grows ?? [];
  const totalPages = data?.totalPages ?? 1;

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      {isLoading ? (
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
            isFetching={isFetching}
            handlePageChange={handlePageChange}
          />
        </>
      )}
    </>
  );
}
