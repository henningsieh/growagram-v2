"use client";

// src/app/[locale]/(protected)/grows/page.tsx:
import { Infinity, Calendar, TentTree } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import PageHeader from "~/components/Layouts/page-header";
import {
  SortFilterControls,
  SortOrder,
} from "~/components/atom/sort-filter-controls";
import InfiniteScrollGrowsView from "~/components/features/Grows/Views/infinite-scroll";
import PaginatedGrowsView from "~/components/features/Grows/Views/paginated";
import { useRouter } from "~/lib/i18n/routing";
import { GrowsSortField, GrowsViewMode } from "~/types/grow";

export default function MyGrowsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Grows");

  // Manage view mode state
  const [viewMode, setViewMode] = useState<GrowsViewMode>(
    (localStorage.getItem("growViewMode") as GrowsViewMode) ||
      GrowsViewMode.PAGINATION,
  );

  // Shared state for sorting
  const [sortField, setSortField] = useState<GrowsSortField>(
    (searchParams?.get("sortField") as GrowsSortField) || GrowsSortField.NAME,
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    (searchParams?.get("sortOrder") as SortOrder) || SortOrder.ASC,
  );
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Update URL parameters
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams(searchParams?.toString());

    // Only include page parameter for pagination mode
    if (viewMode === GrowsViewMode.PAGINATION) {
      params.set("page", searchParams?.get("page") || "1");
    } else {
      // Remove page parameter for infinite scroll
      params.delete("page");
    }

    params.set("sortField", sortField);
    params.set("sortOrder", sortOrder);

    // Only set URL if there are parameters
    const paramsString = params.toString();
    router.replace(paramsString ? `?${paramsString}` : "", { scroll: false });
  }, [searchParams, sortField, sortOrder, router, viewMode]);

  // Sync state with URL
  useEffect(() => {
    updateUrlParams();
  }, [sortField, sortOrder, viewMode, updateUrlParams]);

  // Toggle view mode function
  const toggleViewMode = () => {
    const newMode =
      viewMode === GrowsViewMode.PAGINATION
        ? GrowsViewMode.INFINITE_SCROLL
        : GrowsViewMode.PAGINATION;
    localStorage.setItem("growViewMode", newMode);
    setViewMode(newMode);
  };

  // Shared handler for sort changes
  const handleSortChange = (field: GrowsSortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

  // Define sort options
  const sortOptions = [
    {
      field: GrowsSortField.NAME,
      label: "Name",
      icon: <TentTree className="h-5 w-5" />,
    },
    {
      field: GrowsSortField.CREATED_AT,
      label: t("sort-grows-createdAt"),
      icon: <Calendar className="h-5 w-5" />,
    },
  ];

  return (
    <PageHeader
      title={t("mygrows-page-title")}
      subtitle={t("mygrows-page-subtitle")}
      buttonLink="/grows/new/form"
      buttonLabel={t("buttonLabel-create-grow")}
      buttonVariant={"grow"}
    >
      <SortFilterControls
        isFetching={isFetching}
        sortField={sortField}
        sortOrder={sortOrder}
        sortOptions={sortOptions}
        onSortChange={handleSortChange}
        filterLabel={undefined}
        filterEnabled={undefined}
        onFilterChange={undefined}
        viewMode={{
          current: viewMode,
          options: [GrowsViewMode.PAGINATION, GrowsViewMode.INFINITE_SCROLL],
          label: "Scroll",
          icon: <Infinity className="mr-2 h-4 w-4" />,
        }}
        onViewModeToggle={toggleViewMode}
      />

      {viewMode === GrowsViewMode.PAGINATION ? (
        <PaginatedGrowsView
          sortField={sortField}
          sortOrder={sortOrder}
          setIsFetching={setIsFetching}
        />
      ) : (
        <InfiniteScrollGrowsView
          sortField={sortField}
          sortOrder={sortOrder}
          setIsFetching={setIsFetching}
        />
      )}
    </PageHeader>
  );
}
