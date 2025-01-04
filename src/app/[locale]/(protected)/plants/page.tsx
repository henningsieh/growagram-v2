"use client";

// src/app/[locale]/(protected)/plants/page.tsx:
import {
  Infinity,
  ArrowDown01,
  ArrowDown10,
  ArrowDownAZ,
  ArrowDownZA,
  Calendar,
  Tag,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import PageHeader from "~/components/Layouts/page-header";
import {
  SortFilterControls,
  SortOrder,
} from "~/components/atom/sort-filter-controls";
import InfiniteScrollPlantsView from "~/components/features/Plants/Views/infinite-scroll";
import PaginatedPlantsView from "~/components/features/Plants/Views/paginated";
import { useRouter } from "~/lib/i18n/routing";
import { PlantsSortField, PlantsViewMode } from "~/types/plant";

export default function PlantsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Plants");

  // Manage view mode state
  const [viewMode, setViewMode] = useState<PlantsViewMode>(
    (localStorage.getItem("plantViewMode") as PlantsViewMode) ||
      PlantsViewMode.PAGINATION,
  );

  // Shared state for sorting
  const [sortField, setSortField] = useState<PlantsSortField>(
    (searchParams?.get("sortField") as PlantsSortField) || PlantsSortField.NAME,
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    (searchParams?.get("sortOrder") as SortOrder) || SortOrder.ASC,
  );
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Update URL parameters
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams(searchParams?.toString());

    if (viewMode === PlantsViewMode.PAGINATION) {
      params.set("page", searchParams?.get("page") || "1");
    } else {
      params.delete("page");
    }

    params.set("sortField", sortField);
    params.set("sortOrder", sortOrder);

    const paramsString = params.toString();
    router.push(paramsString ? `?${paramsString}` : "");
  }, [searchParams, sortField, sortOrder, router, viewMode]);

  // Sync state with URL
  useEffect(() => {
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
      icon: <Tag className="h-5 w-5" />,
      sortIconAsc: ArrowDownAZ,
      sortIconDesc: ArrowDownZA,
    },
    {
      field: PlantsSortField.CREATED_AT,
      label: t("sort-plants-createdAt"),
      icon: <Calendar className="h-5 w-5" />,
      sortIconAsc: ArrowDown01,
      sortIconDesc: ArrowDown10,
    },
  ];

  return (
    <PageHeader
      title={t("title")}
      subtitle={t("subtitle")}
      buttonLink="/plants/new/form"
      buttonLabel={t("linkUploadButtonLabel")}
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
          options: [PlantsViewMode.PAGINATION, PlantsViewMode.INFINITE_SCROLL],
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
  );
}
