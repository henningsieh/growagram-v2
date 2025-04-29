// src/components/atom/sort-filter-controls.tsx:
import * as React from "react";
import { useTranslations } from "next-intl";
import {
  ArrowDown01Icon,
  ArrowUp10Icon,
  FilterIcon,
  ScrollText,
} from "lucide-react";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { cn } from "~/lib/utils";

export interface SortOption<T extends string> {
  field: T;
  label: string;
  icon?: React.ReactNode;
}

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

interface SortFilterControlsProps<T extends string> {
  sortField: T;
  sortOrder: SortOrder;
  sortOptions: SortOption<T>[];
  filterEnabled?: boolean;
  filterLabel?: string;
  isFetching?: boolean;
  viewMode?: {
    current: string;
    options: string[];
    label?: string;
    icon?: React.ReactNode;
  };
  // Replace onSortChange with individual setters
  setSortField: (field: T | null) => Promise<URLSearchParams>;
  setSortOrder: (order: SortOrder | null) => Promise<URLSearchParams>;
  onFilterChange?: (checked: boolean) => void;
  onViewModeToggle?: () => void;
}

export function SortFilterControls<T extends string>({
  sortField,
  sortOrder,
  sortOptions,
  filterEnabled = false,
  filterLabel,
  isFetching = false,
  viewMode,
  // Destructure new props
  setSortField,
  setSortOrder,
  onFilterChange,
  onViewModeToggle,
}: SortFilterControlsProps<T>) {
  // Update handlers to call setters directly
  const handleSortFieldChange = async (value: string) => {
    await setSortField(value as T);
  };

  const handleSortOrderChange = async (value: string) => {
    await setSortOrder(value as SortOrder);
  };

  const t = useTranslations("Platform");

  return (
    <div className="bg-card mb-2 flex flex-col gap-4 rounded-md p-2 shadow-md sm:flex-row sm:items-center sm:justify-between">
      {/* Sorting Section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* <div className="flex items-center gap-2"> */}
        <Select
          value={sortField}
          onValueChange={handleSortFieldChange}
          disabled={isFetching}
        >
          <SelectTrigger size="sm" className="border-input w-full min-w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option, index) => (
              <SelectItem key={index} value={option.field}>
                <span className="flex items-center gap-2">
                  {option.icon}
                  {option.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* </div> */}

        {/* <div className="flex items-center gap-2"> */}
        <Select
          value={sortOrder}
          onValueChange={handleSortOrderChange}
          disabled={isFetching}
        >
          <SelectTrigger size="sm" className="border-input w-full min-w-44">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SortOrder.ASC}>
              <div className="flex items-center gap-2">
                <ArrowDown01Icon className="h-6 w-5" /> {t(SortOrder.ASC)}
              </div>
            </SelectItem>
            <SelectItem value={SortOrder.DESC}>
              <div className="flex items-center gap-2">
                <ArrowUp10Icon className="h-6 w-5" /> {t(SortOrder.DESC)}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {/* </div> */}
      </div>

      {/* Filtering Section */}
      <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
        {filterLabel && (
          <div className="flex items-center gap-2">
            <FilterIcon
              className={cn(
                "h-5 w-5",
                filterEnabled ? "text-secondary" : "text-muted-foreground",
              )}
            />
            <Label htmlFor="filter-toggle" className="text-sm font-medium">
              {filterLabel}
            </Label>
            <Switch
              id="filter-toggle"
              checked={filterEnabled}
              onCheckedChange={onFilterChange}
              className="data-[state=checked]:bg-secondary data-[state=unchecked]:hover:bg-secondary/50 dark:data-[state=unchecked]:hover:bg-secondary/50"
              disabled={isFetching}
            />
          </div>
        )}

        {viewMode && (
          <div className="flex items-center gap-2">
            <ScrollText
              className={cn(
                "h-5 w-5",
                viewMode.current && viewMode.current === viewMode.options[1]
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            />
            <Label htmlFor="infinite-scroll" className="text-sm font-medium">
              {t("infinitescroll")}
            </Label>
            <Switch
              id="infinite-scroll"
              checked={viewMode.current === viewMode.options[1]}
              onCheckedChange={onViewModeToggle}
            />
          </div>
        )}
      </div>
    </div>
  );
}
