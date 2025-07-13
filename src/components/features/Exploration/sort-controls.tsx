"use client";

import { useTranslations } from "next-intl";
import {
  ArrowDown01Icon,
  ArrowUp10Icon,
  ArrowUpDownIcon,
  Calendar1Icon,
  ClockIcon,
  TagIcon,
} from "lucide-react";
import {
  type SortOption,
  SortOrder,
} from "~/components/atom/sort-filter-controls";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { GrowsSortField } from "~/types/grow";

interface SortControlsProps {
  sortField: string;
  sortOrder: string;
  onSortFieldChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
}

export function SortControls({
  sortField,
  sortOrder,
  onSortFieldChange,
  onSortOrderChange,
}: SortControlsProps) {
  const t_grows = useTranslations("Grows");
  const t_platform = useTranslations("Platform");

  // Define sort options with icons and labels matching sort-filter-controls.tsx pattern
  const sortOptions: SortOption<GrowsSortField>[] = [
    {
      field: GrowsSortField.NAME,
      label: t_grows("sort-grows-name"),
      icon: <TagIcon className="h-4 w-4" />,
    },
    {
      field: GrowsSortField.UPDATED_AT,
      label: t_grows("sort-grows-updatedAt"),
      icon: <ClockIcon className="h-4 w-4" />,
    },
    {
      field: GrowsSortField.CREATED_AT,
      label: t_grows("sort-grows-createdAt"),
      icon: <Calendar1Icon className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="sort-field" className="text-lg font-medium">
        <ArrowUpDownIcon className="mr-2 inline-block h-5 w-5" />
        {t_grows("sort-label")}
      </Label>
      <div className="grid grid-cols-2 gap-2">
        {/* Sort Field Select */}
        <Select value={sortField} onValueChange={onSortFieldChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent id="sort-field">
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

        {/* Sort Order Select */}
        <Select value={sortOrder} onValueChange={onSortOrderChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SortOrder.DESC}>
              <div className="flex items-center gap-2">
                <ArrowUp10Icon className="h-5 w-6" />{" "}
                {t_platform(SortOrder.DESC)}
              </div>
            </SelectItem>
            <SelectItem value={SortOrder.ASC}>
              <div className="flex items-center gap-2">
                <ArrowDown01Icon className="h-5 w-6" />{" "}
                {t_platform(SortOrder.ASC)}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
