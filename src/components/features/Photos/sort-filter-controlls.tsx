// src/components/features/Photos/sort-filter-controlls.tsx:
import {
  Infinity,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Camera,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { cn } from "~/lib/utils";
import {
  PhotosSortField,
  PhotosSortOrder,
  PhotosViewMode,
} from "~/types/image";

interface ImagesSortFilterControllsProps {
  sortField: PhotosSortField;
  sortOrder: PhotosSortOrder;
  filterNotConnected: boolean;
  isFetching: boolean;
  onSortChange: (
    field: PhotosSortField,
    order: PhotosSortOrder,
  ) => Promise<void>;
  onFilterChange: (checked: boolean) => void;
  toggleViewMode: () => void;
  viewMode?: PhotosViewMode;
}

export default function ImagesSortFilterControlls({
  sortField,
  sortOrder,
  filterNotConnected,
  isFetching,
  onSortChange,
  onFilterChange,
  toggleViewMode,
  viewMode,
}: ImagesSortFilterControllsProps) {
  const toggleOrder = async (field: PhotosSortField) => {
    if (sortField === field) {
      await onSortChange(
        field,
        sortOrder === PhotosSortOrder.ASC
          ? PhotosSortOrder.DESC
          : PhotosSortOrder.ASC,
      );
    } else {
      await onSortChange(field, PhotosSortOrder.DESC);
    }
  };

  return (
    <div className="mb-4 flex flex-col items-center justify-between gap-2 rounded-sm sm:flex-row">
      <div className="flex w-full items-center space-x-2 sm:justify-start">
        {viewMode && (
          <div className="flex h-8 w-full items-center justify-start gap-2 text-nowrap rounded-sm border-[1px] border-input bg-muted px-1 hover:bg-transparent sm:w-[154px]">
            <Switch
              size={"default"}
              id="view-mode"
              checked={viewMode === PhotosViewMode.INFINITE_SCROLL}
              onCheckedChange={toggleViewMode}
            />
            <Label
              htmlFor="view-mode"
              className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              <div className="flex items-center">
                <Infinity className="mr-2 h-4 w-4" />
                Scroll
              </div>
            </Label>
          </div>
        )}
        <div className="flex h-8 w-full items-center justify-start gap-2 text-nowrap rounded-sm border-[1px] border-input bg-muted px-1 hover:bg-transparent sm:w-[154px]">
          <Switch
            size={"default"}
            variant={"secondary"}
            id="filter-not-connected"
            checked={filterNotConnected}
            onCheckedChange={onFilterChange}
          />
          <Label
            htmlFor="filter-not-connected"
            className="cursor-pointer text-base"
          >
            New only
          </Label>
        </div>
      </div>
      <div className="flex w-full items-center space-x-2 sm:justify-end">
        <Button
          disabled={isFetching}
          variant="outline"
          size="sm"
          className={cn(
            "flex w-full items-center justify-between gap-1 p-2 sm:w-[154px]",
            sortField === PhotosSortField.UPLOAD_DATE &&
              "border-[1px] border-secondary text-foreground",
          )}
          onClick={() => toggleOrder(PhotosSortField.UPLOAD_DATE)}
        >
          <div className="flex gap-2">
            <UploadCloud className="h-6 w-5" />
            Upload Date
          </div>
          {isFetching && sortField === PhotosSortField.UPLOAD_DATE ? (
            <Loader2 className="h-6 w-5 animate-spin text-secondary" />
          ) : (
            sortField === PhotosSortField.UPLOAD_DATE &&
            (sortOrder === PhotosSortOrder.DESC ? (
              <ArrowDownWideNarrow className="h-6 w-5 text-secondary" />
            ) : (
              <ArrowUpNarrowWide className="h-6 w-5 text-secondary" />
            ))
          )}
        </Button>
        <Button
          disabled={isFetching}
          variant="outline"
          size="sm"
          className={cn(
            "flex w-full items-center justify-between gap-1 p-2 sm:w-[154px]",
            sortField === PhotosSortField.CAPTURE_DATE &&
              "border-[1px] border-secondary text-foreground",
          )}
          onClick={() => toggleOrder(PhotosSortField.CAPTURE_DATE)}
        >
          <div className="flex gap-2">
            <Camera className="h-6 w-5" />
            Capture Date
          </div>
          {isFetching && sortField === PhotosSortField.CAPTURE_DATE ? (
            <Loader2 className="h-6 w-5 animate-spin text-secondary" />
          ) : (
            sortField === PhotosSortField.CAPTURE_DATE &&
            (sortOrder === PhotosSortOrder.DESC ? (
              <ArrowDownWideNarrow className="h-6 w-5 text-secondary" />
            ) : (
              <ArrowUpNarrowWide className="h-6 w-5 text-secondary" />
            ))
          )}
        </Button>
      </div>
    </div>
  );
}
