// src/components/atom/sort-filter-controls.tsx:
import * as React from "react";
import { useTranslations } from "next-intl";
import {
  ArrowDown01Icon,
  ArrowUp10Icon,
  FilterIcon,
  ScrollText,
} from "lucide-react";
import { Button } from "~/components/ui/button";
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
  onSortChange: (field: T, order: SortOrder) => Promise<void> | void;
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
  onSortChange,
  onFilterChange,
  onViewModeToggle,
}: SortFilterControlsProps<T>) {
  const handleSortFieldChange = (value: string) => {
    onSortChange(value as T, sortOrder);
  };

  const handleSortOrderChange = (value: string) => {
    onSortChange(sortField, value as SortOrder);
  };

  const t = useTranslations("Platform");

  return (
    <div className="xs:grid-cols-2 mb-5 grid grid-cols-1 gap-4 lg:grid-cols-4 lg:items-center">
      {/* Sort Field Select */}
      <div className="flex items-center gap-2">
        <Select
          value={sortField}
          onValueChange={handleSortFieldChange}
          disabled={isFetching}
        >
          <SelectTrigger size="sm" className="border-input w-full">
            <SelectValue />
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
      </div>

      {/* Sort Order Select */}
      <div className="flex items-center gap-2">
        <Select
          value={sortOrder}
          onValueChange={handleSortOrderChange}
          disabled={isFetching}
        >
          <SelectTrigger size="sm" className="border-input w-full">
            <SelectValue />
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
      </div>

      {/* Filter Toggle */}
      {filterLabel && (
        <div className="border-input bg-muted flex h-8 items-center justify-between rounded-sm border p-2">
          <div className="flex items-center gap-2">
            <FilterIcon
              className={`h-5 w-5 ${filterEnabled ? "text-secondary" : "text-muted-foreground"}`}
            />
            <Label htmlFor="filter-toggle" className="text-sm font-medium">
              {filterLabel}
            </Label>
          </div>
          <Switch
            id="filter-toggle"
            checked={filterEnabled}
            onCheckedChange={onFilterChange}
            className="data-[state=checked]:bg-secondary data-[state=unchecked]:hover:bg-secondary/50 dark:data-[state=unchecked]:hover:bg-secondary/50"
            disabled={isFetching}
          />
        </div>
      )}

      {/* Infinite Scroll Toggle */}
      {viewMode && (
        <div className="border-input bg-muted flex h-8 items-center justify-between rounded-sm border p-2">
          <div className="flex items-center gap-2">
            <ScrollText
              className={`h-5 w-5 ${viewMode.current === viewMode.options[1] ? "text-primary" : "text-muted-foreground"}`}
            />
            <Label htmlFor="infinite-scroll" className="text-sm font-medium">
              {t("infinitescroll")}
            </Label>
          </div>
          <Switch
            id="infinite-scroll"
            checked={viewMode.current === viewMode.options[1]}
            onCheckedChange={onViewModeToggle}
          />
        </div>
      )}
    </div>
  );
}
