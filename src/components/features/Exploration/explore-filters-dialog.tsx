"use client";

import React from "react";

import { useTranslations } from "next-intl";

import { FilterIcon, XCircleIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";

import { ResponsiveDialog } from "~/components/atom/responsive-dialog";
import { EnhancedSearchInput } from "~/components/features/Exploration/enhanced-search-input";
import { SortControls } from "~/components/features/Exploration/sort-controls";

import { FilterControls } from "./filter-controls";

interface ExploreFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: {
    environment: string | null;
    cultureMedium: string | null;
    fertilizerType: string | null;
    fertilizerForm: string | null;
    username: string;
    sortField: string;
    sortOrder: string;
  };
  onFilterChange: {
    environment: (value: string) => void;
    cultureMedium: (value: string) => void;
    fertilizerType: (value: string) => void;
    fertilizerForm: (value: string) => void;
    sortField: (value: string) => void;
    sortOrder: (value: string) => void;
  };
  onClearFilters: () => void;
  trigger: React.ReactNode;
}

export function ExploreFiltersDialog({
  open,
  onOpenChange,
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  onClearFilters,
  trigger,
}: ExploreFiltersDialogProps) {
  const t = useTranslations("Exploration");

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} trigger={trigger}>
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>{t("filters.title")}</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          {t("search.placeholder")}
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Content>
        <div className="space-y-8">
          {/* Enhanced Search Input */}
          <EnhancedSearchInput
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            placeholder={t("search.placeholder")}
            onEnterPressed={() => onOpenChange(false)}
          />

          {/* Filter Controls */}
          <div className="space-y-2">
            <Label className="text-lg font-medium">
              <FilterIcon className="mr-2 inline-block h-5 w-5" />
              {t("filters.group-label")}
            </Label>
            <FilterControls filters={filters} onFilterChange={onFilterChange} />
          </div>

          {/* Sort Controls */}
          <SortControls
            sortField={filters.sortField}
            sortOrder={filters.sortOrder}
            onSortFieldChange={onFilterChange.sortField}
            onSortOrderChange={onFilterChange.sortOrder}
          />
        </div>
      </ResponsiveDialog.Content>

      <ResponsiveDialog.Footer>
        <Button
          variant="destructive"
          onClick={onClearFilters}
          className="flex-1"
        >
          <XCircleIcon className="mr-2 h-4 w-4" />
          {t("filters.clear-all")}
        </Button>
        <Button
          variant="primary"
          onClick={onOpenChange.bind(null, false)}
          className="w-f flex-1"
        >
          <FilterIcon className="mr-2 h-4 w-4" />
          {t("filters.apply")}
        </Button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  );
}
