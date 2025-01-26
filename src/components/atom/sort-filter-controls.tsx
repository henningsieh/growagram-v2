import {
  ArrowDown01Icon,
  ArrowUp10Icon,
  FilterIcon,
  ScrollText,
} from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
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

import { Button } from "../ui/button";

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
    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Sorting Controls Group */}
      <div className="flex flex-wrap items-center gap-2">
        {/* <div className="flex items-center space-x-2 rounded-md border bg-card p-1"> */}
        <Select
          value={sortField}
          onValueChange={handleSortFieldChange}
          disabled={isFetching}
        >
          <SelectTrigger className="h-8 w-40 bg-muted">
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

        <Select
          value={sortOrder}
          onValueChange={handleSortOrderChange}
          disabled={isFetching}
        >
          <SelectTrigger className="h-8 w-40 bg-muted">
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
        {/* </div> */}

        {filterLabel && (
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "relative border border-input text-muted-foreground",
              filterEnabled &&
                "bg-secondary/80 text-secondary-foreground hover:bg-secondary/90",
            )}
            onClick={() => onFilterChange?.(!filterEnabled)}
            disabled={isFetching}
          >
            <FilterIcon className="mr-2 h-4 w-4" />
            {filterLabel}
          </Button>
        )}
      </div>

      {/* Infinite Scroll Toggle Group - Visually separated */}
      {viewMode && (
        <div className="flex justify-end">
          <div className="flex h-8 items-center gap-3 rounded-sm border border-input bg-muted p-2">
            <Label
              htmlFor="infinite-scroll"
              className="cursor-pointer text-sm font-medium"
            >
              {t("infinitescroll")}
            </Label>
            <Switch
              id="infinite-scroll"
              checked={viewMode.current === viewMode.options[1]}
              onCheckedChange={onViewModeToggle}
              className="data-[state=checked]:bg-primary"
            />
            <ScrollText
              className={`h-5 w-5 ${viewMode.current === viewMode.options[1] ? `text-primary` : `text-muted-foreground`}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
