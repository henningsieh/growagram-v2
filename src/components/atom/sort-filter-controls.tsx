import { Loader2, LucideProps } from "lucide-react";
import React, { ForwardRefExoticComponent, RefAttributes } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { cn } from "~/lib/utils";

export interface SortOption<T extends string> {
  field: T;
  label: string;
  icon?: React.ReactNode;
  sortIconAsc: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  sortIconDesc: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
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
  filterLabel = "Filter",
  isFetching = false,
  viewMode,
  onSortChange,
  onFilterChange,
  onViewModeToggle,
}: SortFilterControlsProps<T>) {
  const toggleOrder = async (field: T) => {
    if (sortField === field) {
      await onSortChange(
        field,
        sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC,
      );
    } else {
      await onSortChange(field, SortOrder.DESC);
    }
  };

  return (
    <div className="mb-6 flex flex-col items-center justify-between gap-2 rounded-sm lg:flex-row">
      <div className="flex w-full items-center space-x-2 lg:justify-start">
        {viewMode && (
          <div className="flex h-8 w-full items-center justify-start gap-2 text-nowrap rounded-sm border-[1px] border-input bg-muted px-1 hover:bg-transparent lg:w-[154px]">
            <Switch
              size="default"
              id="view-mode"
              checked={viewMode.current === viewMode.options[1]}
              onCheckedChange={onViewModeToggle}
            />
            <Label
              htmlFor="view-mode"
              className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              <div className="flex items-center">
                {viewMode.icon}
                {viewMode.label}
              </div>
            </Label>
          </div>
        )}
        {onFilterChange && (
          <div className="flex h-8 w-full items-center justify-start gap-2 text-nowrap rounded-sm border-[1px] border-input bg-muted px-1 hover:bg-transparent lg:w-[154px]">
            <Switch
              size="default"
              variant="secondary"
              id="filter-toggle"
              checked={filterEnabled}
              onCheckedChange={onFilterChange}
            />
            <Label htmlFor="filter-toggle" className="cursor-pointer text-base">
              {filterLabel}
            </Label>
          </div>
        )}
      </div>
      <div className="flex w-full items-center space-x-2 lg:justify-end">
        {sortOptions.map((option, index) => (
          <Button
            key={index}
            disabled={isFetching}
            variant="outline"
            size="sm"
            className={cn(
              "flex w-full items-center justify-between gap-1 p-2 lg:w-[154px]",
              sortField === option.field &&
                "border-[1px] border-secondary text-foreground",
            )}
            onClick={() => toggleOrder(option.field)}
          >
            <div className="flex gap-2">
              {option.icon}
              {option.label}
            </div>
            {isFetching && sortField === option.field ? (
              <Loader2 className="h-6 w-5 animate-spin text-secondary" />
            ) : (
              sortField === option.field &&
              (sortOrder === SortOrder.ASC ? (
                // ${<ArrowASC className="h-6 w-5 text-secondary" />}
                <option.sortIconAsc className="h-6 w-5 text-secondary" />
              ) : (
                <option.sortIconDesc className="h-6 w-5 text-secondary" />
              ))
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
