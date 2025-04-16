"use client";

// src/app/[locale]/(protected)/photos/page.tsx:
import * as React from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Infinity, Camera, UploadCloud } from "lucide-react";
import { modulePaths } from "~/assets/constants";
import { BreadcrumbSetter } from "~/components/Layouts/Breadcrumbs/breadcrumb-setter";
import PageHeader from "~/components/Layouts/page-header";
import {
  SortFilterControls,
  SortOrder,
} from "~/components/atom/sort-filter-controls";
import PhotosInfiniteScrollView from "~/components/features/Photos/Views/infinite-scroll";
import PhotosPaginatedView from "~/components/features/Photos/Views/paginated";
import { createBreadcrumbs } from "~/lib/breadcrumbs";
import { useRouter } from "~/lib/i18n/routing";
import { PhotosSortField, PhotosViewMode } from "~/types/image";

export default function MyImagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Photos");

  // Create breadcrumbs for this page using sidebar translation keys
  const breadcrumbs = createBreadcrumbs([
    {
      translationKey: "Photos.my-Photos",
      path: modulePaths.PHOTOS.path,
    },
  ]);

  // Manage view mode state
  const [viewMode, setViewMode] = React.useState<string>(
    (localStorage.getItem("photoViewMode") as PhotosViewMode) ||
      PhotosViewMode.PAGINATION,
  );

  // Shared state for sorting and filtering
  const [sortField, setSortField] = React.useState<PhotosSortField>(
    (searchParams?.get("sortField") as PhotosSortField) ||
      PhotosSortField.UPLOAD_DATE,
  );
  const [sortOrder, setSortOrder] = React.useState<SortOrder>(
    (searchParams?.get("sortOrder") as SortOrder) || SortOrder.DESC,
  );
  const [filterNotConnected, setFilterNotConnected] = React.useState(
    searchParams?.get("filterNotConnected") === "true",
  );
  const [isFetching, setIsFetching] = React.useState<boolean>(false);

  // Update URL parameters
  const updateUrlParams = React.useCallback(() => {
    const params = new URLSearchParams();
    if ((viewMode as PhotosViewMode) === PhotosViewMode.PAGINATION) {
      params.set("page", searchParams?.get("page") || "1");
    } else {
      params.delete("page");
    }
    params.set("sortField", sortField);
    params.set("sortOrder", sortOrder);
    params.set("filterNotConnected", filterNotConnected.toString());

    // Only set URL if there are parameters
    const paramsString = params.toString();
    router.replace(paramsString ? `?${paramsString}` : "", { scroll: false });
  }, [
    searchParams,
    sortField,
    sortOrder,
    filterNotConnected,
    viewMode,
    router,
  ]);

  // Sync state with URL
  React.useEffect(() => {
    updateUrlParams();
  }, [sortField, sortOrder, filterNotConnected, updateUrlParams]);

  // Toggle view mode function
  const toggleViewMode = () => {
    const newMode =
      (viewMode as PhotosViewMode) === PhotosViewMode.PAGINATION
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
      label: t("uploaded-at"),
      icon: <UploadCloud className="h-6 w-5" />,
    },
    {
      field: PhotosSortField.CAPTURE_DATE,
      label: t("capture-date"),
      icon: <Camera className="h-6 w-5" />,
    },
  ];

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

        {(viewMode as PhotosViewMode) === PhotosViewMode.PAGINATION ? (
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
    </>
  );
}
