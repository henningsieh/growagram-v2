"use client";

// src/app/[locale]/(protected)/grows/page.tsx:
import * as React from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Infinity, Calendar1Icon, PenSquareIcon, TentTree } from "lucide-react";
import { modulePaths } from "~/assets/constants";
import { BreadcrumbSetter } from "~/components/Layouts/Breadcrumbs/breadcrumb-setter";
import PageHeader from "~/components/Layouts/page-header";
import {
  SortFilterControls,
  SortOrder,
} from "~/components/atom/sort-filter-controls";
import InfiniteScrollGrowsView from "~/components/features/Grows/Views/infinite-scroll";
import PaginatedGrowsView from "~/components/features/Grows/Views/paginated";
import { createBreadcrumbs } from "~/lib/breadcrumbs/breadcrumbs";
import { useRouter } from "~/lib/i18n/routing";
import { GrowsSortField, GrowsViewMode } from "~/types/grow";

export default function MyGrowsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Grows");

  // Create breadcrumbs for this page using sidebar translation keys
  const breadcrumbs = createBreadcrumbs([
    {
      translationKey: "Sidebar.navMain.Grows.items.My Grows",
      path: modulePaths.GROWS.path,
    },
  ]);

  // Manage view mode state
  const [viewMode, setViewMode] = React.useState<GrowsViewMode>(
    (localStorage.getItem("growViewMode") as GrowsViewMode) ||
      GrowsViewMode.PAGINATION,
  );

  // Shared state for sorting
  const [sortField, setSortField] = React.useState<GrowsSortField>(
    (searchParams?.get("sortField") as GrowsSortField) || GrowsSortField.NAME,
  );
  const [sortOrder, setSortOrder] = React.useState<SortOrder>(
    (searchParams?.get("sortOrder") as SortOrder) || SortOrder.ASC,
  );
  const [isFetching, setIsFetching] = React.useState<boolean>(false);

  // Update URL parameters
  const updateUrlParams = React.useCallback(() => {
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
  React.useEffect(() => {
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
      icon: <Calendar1Icon className="h-5 w-5" />,
    },
    {
      field: GrowsSortField.UPDATED_AT,
      label: t("sort-grows-updatedAt"),
      icon: <PenSquareIcon className="h-5 w-5" />,
    },
  ];

  return (
    <>
      <BreadcrumbSetter items={breadcrumbs} />
      <PageHeader
        title={t("mygrows-page-title")}
        subtitle={t("mygrows-page-subtitle")}
        buttonLink="/grows/new/form"
        buttonLabel={t("button-label-create-grow")}
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
    </>
  );
}
