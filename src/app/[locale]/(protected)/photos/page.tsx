"use client";

// src/app/[locale]/(protected)/photos/page.tsx:
import {
  Infinity,
  ArrowDown01,
  ArrowDown10,
  Camera,
  UploadCloud,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import PageHeader from "~/components/Layouts/page-header";
import {
  SortFilterControls,
  SortOrder,
} from "~/components/atom/sort-filter-controls";
import PhotosInfiniteScrollView from "~/components/features/Photos/Views/infinite-scroll";
import PhotosPaginatedView from "~/components/features/Photos/Views/paginated";
import { useRouter } from "~/lib/i18n/routing";
import { PhotosSortField, PhotosViewMode } from "~/types/image";

export default function AllImagesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Manage view mode state
  const [viewMode, setViewMode] = useState<string>(
    (localStorage.getItem("photoViewMode") as PhotosViewMode) ||
      PhotosViewMode.PAGINATION,
  );

  // Shared state for sorting and filtering
  const [sortField, setSortField] = useState<PhotosSortField>(
    (searchParams?.get("sortField") as PhotosSortField) ||
      PhotosSortField.UPLOAD_DATE,
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    (searchParams?.get("sortOrder") as SortOrder) || SortOrder.DESC,
  );
  const [filterNotConnected, setFilterNotConnected] = useState(
    searchParams?.get("filterNotConnected") === "true",
  );
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Update URL parameters
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", searchParams?.get("page") || "1");
    params.set("sortField", sortField);
    params.set("sortOrder", sortOrder);
    params.set("filterNotConnected", filterNotConnected.toString());
    router.push(`?${params.toString()}`);
  }, [searchParams, sortField, sortOrder, filterNotConnected, router]);

  // Sync state with URL
  useEffect(() => {
    updateUrlParams();
  }, [sortField, sortOrder, filterNotConnected, updateUrlParams]);

  // Toggle view mode function
  const toggleViewMode = () => {
    const newMode =
      viewMode === PhotosViewMode.PAGINATION
        ? PhotosViewMode.INFINITE_SCROLL
        : PhotosViewMode.PAGINATION;
    localStorage.setItem("photoViewMode", newMode);
    setViewMode(newMode);
  };

  // Shared handler for sort changes
  const handleSortChange = (field: PhotosSortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

  // Shared handler for filter changes
  const handleFilterChange = (checked: boolean) => {
    setFilterNotConnected(checked);
  };

  // Define sort options
  const sortOptions = [
    {
      field: PhotosSortField.UPLOAD_DATE,
      label: "Upload Date",
      icon: <UploadCloud className="h-6 w-5" />,
      sortIconAsc: ArrowDown01,
      sortIconDesc: ArrowDown10,
    },
    {
      field: PhotosSortField.CAPTURE_DATE,
      label: "Capture Date",
      icon: <Camera className="h-6 w-5" />,
      sortIconAsc: ArrowDown01,
      sortIconDesc: ArrowDown10,
    },
  ];

  return (
    <PageHeader
      title="My Photos"
      subtitle="View and manage your photos"
      buttonLink="/photos/upload"
      buttonLabel="Upload new Photos"
    >
      <SortFilterControls
        isFetching={isFetching}
        sortField={sortField}
        sortOrder={sortOrder}
        sortOptions={sortOptions}
        onSortChange={handleSortChange}
        filterLabel="New only"
        filterEnabled={filterNotConnected}
        onFilterChange={handleFilterChange}
        viewMode={{
          current: viewMode,
          options: [PhotosViewMode.PAGINATION, PhotosViewMode.INFINITE_SCROLL],
          label: "Scroll",
          icon: <Infinity className="mr-2 h-4 w-4" />,
        }}
        onViewModeToggle={toggleViewMode}
      />

      {viewMode === PhotosViewMode.PAGINATION ? (
        <PhotosPaginatedView
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
    </PageHeader>
  );
}
