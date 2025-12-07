"use client";

// src/app/[locale]/(protected)/plants/page.tsx:
import * as React from "react";

import { useSearchParams } from "next/navigation";

import { useTranslations } from "next-intl";

import { Infinity, Calendar1Icon, Edit3Icon, TagIcon } from "lucide-react";

import { BreadcrumbSetter } from "~/components/Layouts/Breadcrumbs/breadcrumb-setter";
import PageHeader from "~/components/Layouts/page-header";
import {
  SortFilterControls,
  SortOrder,
} from "~/components/atom/sort-filter-controls";
import InfiniteScrollPlantsView from "~/components/features/Plants/Views/infinite-scroll";
import PaginatedPlantsView from "~/components/features/Plants/Views/paginated";

import { PlantsSortField, PlantsViewMode } from "~/types/plant";

import { createBreadcrumbs } from "~/lib/breadcrumbs/breadcrumbs";
import { useRouter } from "~/lib/i18n/routing";

import { modulePaths } from "~/assets/constants";

export default function MyPlantsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Plants");

  // Create breadcrumbs for this page using sidebar translation keys
  const breadcrumbs = createBreadcrumbs([
    {
      translationKey: "Plants.myplants-page-title",
      path: modulePaths.PLANTS.path,
    },
  ]);

  // Manage view mode state
  const [viewMode, setViewMode] = React.useState<PlantsViewMode>(
    (localStorage.getItem("plantViewMode") as PlantsViewMode) ||
      PlantsViewMode.PAGINATION,
  );

  // Shared state for sorting
  const [sortField, setSortField] = React.useState<PlantsSortField>(
    (searchParams?.get("sortField") as PlantsSortField) || PlantsSortField.NAME,
  );
  const [sortOrder, setSortOrder] = React.useState<SortOrder>(
    (searchParams?.get("sortOrder") as SortOrder) || SortOrder.ASC,
  );
  const [isFetching, setIsFetching] = React.useState<boolean>(false);

  // Update URL parameters
  const updateUrlParams = React.useCallback(() => {
    const params = new URLSearchParams(searchParams?.toString());

    if (viewMode === PlantsViewMode.PAGINATION) {
      params.set("page", searchParams?.get("page") || "1");
    } else {
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
      viewMode === PlantsViewMode.PAGINATION
        ? PlantsViewMode.INFINITE_SCROLL
        : PlantsViewMode.PAGINATION;
    localStorage.setItem("plantViewMode", newMode);
    setViewMode(newMode);
  };

  // Shared handler for sort changes
  const handleSortChange = (field: PlantsSortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

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
      icon: <Calendar1Icon className="h-5 w-5" />,
    },
    {
      field: PlantsSortField.UPDATED_AT,
      label: t("sort-plants-updatedAt"),
      icon: <Edit3Icon className="h-5 w-5" />,
    },
  ];

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

        {viewMode === PlantsViewMode.PAGINATION ? (
          <PaginatedPlantsView
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
      </PageHeader>
    </>
  );
}
