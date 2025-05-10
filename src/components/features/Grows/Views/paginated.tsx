import * as React from "react";
import { useTranslations } from "next-intl";
import { useSuspenseQuery } from "@tanstack/react-query";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import ItemsPagination from "~/components/atom/item-pagination";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { GrowCard } from "~/components/features/Grows/grow-card";
import { getOwnGrowsInput } from "~/lib/queries/grows";
import type { GetOwnGrowsInput } from "~/server/api/root";
import { useTRPC } from "~/trpc/client";
import { GrowsSortField } from "~/types/grow";

interface PaginatedGrowsViewProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  sortField: GrowsSortField;
  sortOrder: SortOrder;
  setIsFetching: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PaginatedGrowsView({
  currentPage: cursor,
  onPageChange,
  sortField,
  sortOrder,
  setIsFetching,
}: PaginatedGrowsViewProps) {
  const trpc = useTRPC();
  const t = useTranslations("Grows");

  const growsQuery = useSuspenseQuery(
    trpc.grows.getOwnGrows.queryOptions({
      ...getOwnGrowsInput,
      cursor: cursor,
      sortField: sortField,
      sortOrder: sortOrder,
    } satisfies GetOwnGrowsInput),
  );

  // Extract grows data
  const { grows, totalPages } = growsQuery.data;

  // Directly update the parent's isFetching state
  React.useEffect(() => {
    setIsFetching(growsQuery.isFetching);
  }, [growsQuery.isFetching, setIsFetching]);

  return (
    <>
      {grows.length === 0 ? (
        <p className="text-muted-foreground mt-8 text-center">
          {t("no-grows-yet")}
        </p>
      ) : (
        <>
          <ResponsiveGrid>
            {grows.map((grow) => (
              <GrowCard key={grow.id} grow={grow} isSocial={false} />
            ))}
          </ResponsiveGrid>

          <ItemsPagination
            currentPage={cursor}
            totalPages={totalPages}
            isFetching={growsQuery.isFetching}
            handlePageChange={onPageChange}
          />
        </>
      )}
    </>
  );
}
