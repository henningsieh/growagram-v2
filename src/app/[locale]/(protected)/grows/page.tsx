"use client";

// src/app/[locale]/(protected)/grows/page.tsx:
import * as React from "react";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Infinity, Calendar1Icon, PenSquareIcon, TentTree } from "lucide-react";
import { createParser, parseAsStringLiteral, useQueryState } from "nuqs";
import { modulePaths } from "~/assets/constants";
import { BreadcrumbSetter } from "~/components/Layouts/Breadcrumbs/breadcrumb-setter";
import PageHeader from "~/components/Layouts/page-header";
import { ErrorBoundary } from "~/components/atom/error-boundary";
import {
  SortFilterControls,
  SortOrder,
} from "~/components/atom/sort-filter-controls";
import SpinningLoader from "~/components/atom/spinning-loader";
import InfiniteScrollGrowsView from "~/components/features/Grows/Views/infinite-scroll";
import PaginatedGrowsView from "~/components/features/Grows/Views/paginated";
import { createBreadcrumbs } from "~/lib/breadcrumbs";
import { DEFAULT_GROW_SORT_FIELD } from "~/lib/queries/grows";
import { GrowsSortField, GrowsViewMode } from "~/types/grow";

// Create a parser for GrowsSortField
const sortFieldParser = createParser({
  parse: (value) => {
    return Object.values(GrowsSortField).includes(value as GrowsSortField)
      ? (value as GrowsSortField)
      : DEFAULT_GROW_SORT_FIELD;
  },
  serialize: (value: GrowsSortField) => value,
});

// Create a parser for SortOrder
const sortOrderParser = createParser({
  parse: (value) => {
    return Object.values(SortOrder).includes(value as SortOrder)
      ? (value as SortOrder)
      : SortOrder.ASC;
  },
  serialize: (value: SortOrder) => value,
});

// Create a parser for GrowsViewMode
const viewModeParser = parseAsStringLiteral([
  GrowsViewMode.PAGINATION,
  GrowsViewMode.INFINITE_SCROLL,
]).withDefault(GrowsViewMode.PAGINATION);

export default function MyGrowsPage() {
  const t = useTranslations("Grows");

  const [page, setPage] = useQueryState("page", { defaultValue: "1" });
  const [isFetching, setIsFetching] = React.useState<boolean>(false);

  // Use nuqs for URL state management
  const [sortField, setSortField] = useQueryState(
    "sortField",
    sortFieldParser.withDefault(DEFAULT_GROW_SORT_FIELD),
  );

  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    sortOrderParser.withDefault(SortOrder.ASC),
  );
  const [viewMode, setViewMode] = useQueryState("viewMode", viewModeParser);

  React.useEffect(() => {
    // Sync localStorage with URL on initial load
    const storedViewMode = localStorage.getItem(
      "growViewMode",
    ) as GrowsViewMode;
    if (storedViewMode && storedViewMode !== viewMode) {
      void setViewMode(storedViewMode);
    }
  }, [setViewMode, viewMode]);

  // Toggle view mode function
  const toggleViewMode = React.useCallback(async () => {
    try {
      const newMode =
        viewMode === GrowsViewMode.PAGINATION
          ? GrowsViewMode.INFINITE_SCROLL
          : GrowsViewMode.PAGINATION;

      localStorage.setItem("growViewMode", newMode);
      await setViewMode(newMode);

      // Clear page parameter when switching to infinite scroll
      if (newMode === GrowsViewMode.INFINITE_SCROLL) {
        await setPage(null);
      } else {
        await setPage("1");
      }
    } catch (error) {
      console.error("Error updating URL parameters:", error);
    }
  }, [viewMode, setViewMode, setPage]);

  // Shared handler for sort changes
  const handleSortChange = React.useCallback(
    async (field: GrowsSortField, order: SortOrder) => {
      try {
        await Promise.all([setSortField(field), setSortOrder(order)]);
      } catch (error) {
        console.error("Error updating sort parameters:", error);
      }
    },
    [setSortField, setSortOrder],
  );

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
      icon: <Calendar1Icon className="h-5 w-5" />,
    },
    {
      field: GrowsSortField.UPDATED_AT,
      label: t("sort-grows-updatedAt"),
      icon: <PenSquareIcon className="h-5 w-5" />,
    },
  ];

  // Handle page changes from the paginated view
  const handlePageChange = React.useCallback(
    async (newPage: number) => {
      try {
        await setPage(newPage.toString());
      } catch (error) {
        console.error("Error updating page:", error);
      }
    },
    [setPage],
  );

  // Create breadcrumbs for this page using sidebar translation keys
  const breadcrumbs = createBreadcrumbs([
    {
      translationKey: "Sidebar.navMain.Grows.items.My Grows",
      path: modulePaths.GROWS.path,
    },
  ]);

  return (
    <>
      <BreadcrumbSetter items={breadcrumbs} />
      <PageHeader
        title={t("mygrows-page-title")}
        subtitle={t("mygrows-page-subtitle")}
        buttonLink="/grows/new/form"
        buttonLabel={t("button-label-create-grow")}
        buttonVariant={"secondary"}
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

        <ErrorBoundary>
          <Suspense
            fallback={
              <SpinningLoader className="text-primary mx-auto my-8 size-28" />
            }
          >
            {viewMode === GrowsViewMode.PAGINATION ? (
              <PaginatedGrowsView
                currentPage={parseInt(page)}
                onPageChange={handlePageChange}
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
          </Suspense>
        </ErrorBoundary>
      </PageHeader>
    </>
  );
}
