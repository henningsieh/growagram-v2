"use client";

// src/app/[locale]/(protected)/plants/page.tsx:
import * as React from "react";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Infinity, Calendar, TagIcon } from "lucide-react";
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
import InfiniteScrollPlantsView from "~/components/features/Plants/Views/infinite-scroll";
import PaginatedPlantsView from "~/components/features/Plants/Views/paginated";
import { createBreadcrumbs } from "~/lib/breadcrumbs";
import { DEFAULT_PLANT_SORT_FIELD } from "~/lib/queries/plants";
import { PlantsSortField, PlantsViewMode } from "~/types/plant";

// Create a parser for PlantsSortField
const sortFieldParser = createParser({
  parse: (value) => {
    return Object.values(PlantsSortField).includes(value as PlantsSortField)
      ? (value as PlantsSortField)
      : DEFAULT_PLANT_SORT_FIELD;
  },
  serialize: (value: PlantsSortField) => value,
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

// Create a parser for PlantsViewMode
const viewModeParser = parseAsStringLiteral([
  PlantsViewMode.PAGINATION,
  PlantsViewMode.INFINITE_SCROLL,
]).withDefault(PlantsViewMode.PAGINATION);

export default function MyPlantsPage() {
  const t = useTranslations("Plants");

  const [page, setPage] = useQueryState("page", { defaultValue: "1" });
  const [isFetching, setIsFetching] = React.useState<boolean>(false);

  // Use nuqs for URL state management
  const [sortField, setSortField] = useQueryState(
    "sortField",
    sortFieldParser.withDefault(DEFAULT_PLANT_SORT_FIELD),
  );

  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    sortOrderParser.withDefault(SortOrder.ASC),
  );
  const [viewMode, setViewMode] = useQueryState("viewMode", viewModeParser);

  React.useEffect(() => {
    // Sync localStorage with URL on initial load
    const storedViewMode = localStorage.getItem(
      "plantViewMode",
    ) as PlantsViewMode;
    if (storedViewMode && storedViewMode !== viewMode) {
      void setViewMode(storedViewMode);
    }
  }, [setViewMode, viewMode]);

  // Toggle view mode function
  const toggleViewMode = React.useCallback(async () => {
    try {
      const newMode =
        viewMode === PlantsViewMode.PAGINATION
          ? PlantsViewMode.INFINITE_SCROLL
          : PlantsViewMode.PAGINATION;

      localStorage.setItem("plantViewMode", newMode);
      await setViewMode(newMode);

      // Clear page parameter when switching to infinite scroll
      if (newMode === PlantsViewMode.INFINITE_SCROLL) {
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
    async (field: PlantsSortField, order: SortOrder) => {
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
      field: PlantsSortField.NAME,
      label: "Name",
      icon: <TagIcon className="h-5 w-5" />,
    },
    {
      field: PlantsSortField.CREATED_AT,
      label: t("sort-plants-createdAt"),
      icon: <Calendar className="h-5 w-5" />,
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
      translationKey: "Plants.myplants-page-title",
      path: modulePaths.PLANTS.path,
    },
  ]);

  return (
    <>
      <BreadcrumbSetter items={breadcrumbs} />
      <PageHeader
        title={t("myplants-page-title")}
        subtitle={t("myplants-page-subtitle")}
        buttonLink="/plants/new/form"
        buttonLabel={t("button-label-create-plant")}
        buttonVariant={"primary"}
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
            options: [
              PlantsViewMode.PAGINATION,
              PlantsViewMode.INFINITE_SCROLL,
            ],
            label: "Scroll",
            icon: <Infinity className="mr-2 h-4 w-4" />,
          }}
          onViewModeToggle={toggleViewMode}
        />

        <ErrorBoundary>
          <Suspense
            fallback={
              <SpinningLoader className="text-secondary mx-auto my-8 size-28" />
            }
          >
            {viewMode === PlantsViewMode.PAGINATION ? (
              <PaginatedPlantsView
                currentPage={parseInt(page)}
                onPageChange={handlePageChange}
                sortField={sortField}
                sortOrder={sortOrder}
                setIsFetching={setIsFetching}
              />
            ) : (
              <InfiniteScrollPlantsView
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
