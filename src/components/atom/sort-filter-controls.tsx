import { ArrowDown01Icon, ArrowUp10Icon } from "lucide-react";
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

import SpinningLoader from "../Layouts/loader";

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
  filterLabel = "Filter",
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
    <div className="mb-5 flex flex-col items-center justify-between gap-2 rounded-sm lg:flex-row">
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
              variant="default"
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
        <Select
          disabled={isFetching}
          value={sortField}
          onValueChange={handleSortFieldChange}
        >
          <SelectTrigger className="">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.field} value={option.field}>
                <div className="flex items-center gap-2 font-semibold">
                  {isFetching ? (
                    <SpinningLoader className="h-6 w-5" />
                  ) : (
                    <div className="h-6 w-5">{option.icon}</div>
                  )}
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          disabled={isFetching}
          value={sortOrder}
          onValueChange={handleSortOrderChange}
        >
          <SelectTrigger className="">
            <SelectValue className="w-full" placeholder="Order" />
          </SelectTrigger>
          <SelectContent className="font-bold">
            <SelectItem value={SortOrder.ASC}>
              <div className="flex items-center gap-2 font-semibold">
                {isFetching ? (
                  <SpinningLoader className="h-6 w-5" />
                ) : (
                  <ArrowDown01Icon className="h-6 w-5" />
                )}
                {t(SortOrder.ASC)}
              </div>
            </SelectItem>
            <SelectItem value={SortOrder.DESC}>
              <div className="flex items-center gap-3">
                {isFetching ? (
                  <SpinningLoader className="h-6 w-5" />
                ) : (
                  <ArrowUp10Icon className="h-6 w-5" />
                )}
                {t(SortOrder.DESC)}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
