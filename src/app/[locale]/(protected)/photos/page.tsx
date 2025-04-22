"use client";

import * as React from "react";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Infinity, Camera, UploadCloud } from "lucide-react";
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
import PhotosInfiniteScrollView from "~/components/features/Photos/Views/infinite-scroll";
import PhotosPaginatedView from "~/components/features/Photos/Views/paginated";
import { createBreadcrumbs } from "~/lib/breadcrumbs";
import { DEFAULT_PHOTO_SORT_FIELD } from "~/lib/queries/photos";
import { PhotosSortField, PhotosViewMode } from "~/types/image";

// Create a parser for PhotosSortField
const sortFieldParser = createParser({
  parse: (value) => {
    return Object.values(PhotosSortField).includes(value as PhotosSortField)
      ? (value as PhotosSortField)
      : DEFAULT_PHOTO_SORT_FIELD;
  },
  serialize: (value: PhotosSortField) => value,
});

// Create a parser for SortOrder
const sortOrderParser = createParser({
  parse: (value) => {
    return Object.values(SortOrder).includes(value as SortOrder)
      ? (value as SortOrder)
      : SortOrder.DESC;
  },
  serialize: (value: SortOrder) => value,
});

// Create a parser for PhotosViewMode
const viewModeParser = parseAsStringLiteral([
  PhotosViewMode.PAGINATION,
  PhotosViewMode.INFINITE_SCROLL,
]).withDefault(PhotosViewMode.PAGINATION);

// Create a parser for filterNotConnected
const filterParser = createParser({
  parse: (value) => {
    return value === "true";
  },
  serialize: (value: boolean) => value.toString(),
});

export default function MyImagesPage() {
  const t = useTranslations("Photos");

  const [page, setPage] = useQueryState("page", { defaultValue: "1" });
  const [isFetching, setIsFetching] = React.useState<boolean>(false);

  // Use nuqs for URL state management
  const [sortField, setSortField] = useQueryState(
    "sortField",
    sortFieldParser.withDefault(DEFAULT_PHOTO_SORT_FIELD),
  );

  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    sortOrderParser.withDefault(SortOrder.DESC),
  );

  const [filterNotConnected, setFilterNotConnected] = useQueryState(
    "filterNotConnected",
    filterParser.withDefault(false),
  );

  const [viewMode, setViewMode] = useQueryState("viewMode", viewModeParser);

  React.useEffect(() => {
    // Sync localStorage with URL on initial load
    const storedViewMode = localStorage.getItem(
      "photoViewMode",
    ) as PhotosViewMode;
    if (storedViewMode && storedViewMode !== viewMode) {
      void setViewMode(storedViewMode);
    }
  }, [setViewMode, viewMode]);

  // Toggle view mode function
  const toggleViewMode = React.useCallback(async () => {
    try {
      const newMode =
        viewMode === PhotosViewMode.PAGINATION
          ? PhotosViewMode.INFINITE_SCROLL
          : PhotosViewMode.PAGINATION;

      localStorage.setItem("photoViewMode", newMode);
      await setViewMode(newMode);

      // Clear page parameter when switching to infinite scroll
      if (newMode === PhotosViewMode.INFINITE_SCROLL) {
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
    async (field: PhotosSortField, order: SortOrder) => {
      try {
        await Promise.all([setSortField(field), setSortOrder(order)]);
      } catch (error) {
        console.error("Error updating sort parameters:", error);
      }
    },
    [setSortField, setSortOrder],
  );

  // Shared handler for filter changes
  const handleFilterChange = React.useCallback(
    async (checked: boolean) => {
      try {
        await setFilterNotConnected(checked);
      } catch (error) {
        console.error("Error updating filter parameter:", error);
      }
    },
    [setFilterNotConnected],
  );

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

  // Define sort options
  const sortOptions = [
    {
      field: PhotosSortField.CAPTURE_DATE,
      label: t("capture-date"),
      icon: <Camera className="h-5 w-5" />,
    },
    {
      field: PhotosSortField.UPLOAD_DATE,
      label: t("uploaded-at"),
      icon: <UploadCloud className="h-5 w-5" />,
    },
  ];

  // Create breadcrumbs for this page using sidebar translation keys
  const breadcrumbs = createBreadcrumbs([
    {
      translationKey: "Photos.my-Photos",
      path: modulePaths.PHOTOS.path,
    },
  ]);

  return (
    <>
      <BreadcrumbSetter items={breadcrumbs} />
      <PageHeader
        title={t("my-Photos")}
        subtitle={t("my-Photos-subtitle")}
        buttonLink={`${modulePaths.PHOTOS.path}/upload`}
        buttonLabel={t("button-label-upload-photos")}
      >
        <SortFilterControls
          isFetching={isFetching}
          sortField={sortField}
          sortOrder={sortOrder}
          sortOptions={sortOptions}
          onSortChange={handleSortChange}
          filterLabel={t("filter-label-not-connected")}
          filterEnabled={filterNotConnected}
          onFilterChange={handleFilterChange}
          viewMode={{
            current: viewMode,
            options: [
              PhotosViewMode.PAGINATION,
              PhotosViewMode.INFINITE_SCROLL,
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
            {viewMode === PhotosViewMode.PAGINATION ? (
              <PhotosPaginatedView
                currentPage={parseInt(page)}
                onPageChange={handlePageChange}
                sortField={sortField}
                sortOrder={sortOrder}
                filterNotConnected={filterNotConnected}
                setIsFetching={setIsFetching}
              />
            ) : (
              <PhotosInfiniteScrollView
                sortField={sortField}
                sortOrder={sortOrder}
                filterNotConnected={filterNotConnected}
                setIsFetching={setIsFetching}
              />
            )}
          </Suspense>
        </ErrorBoundary>
      </PageHeader>
    </>
  );
}
