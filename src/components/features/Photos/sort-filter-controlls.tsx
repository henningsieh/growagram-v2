import {
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
import { ImageSortField, ImageSortOrder } from "~/types/image";

interface ImagesSortFilterControllsProps {
  sortField: ImageSortField;
  sortOrder: ImageSortOrder;
  filterNotConnected: boolean;
  isFetching: boolean;
  onSortChange: (field: ImageSortField, order: ImageSortOrder) => Promise<void>;
  onFilterChange: (checked: boolean) => void;
}

export default function ImagesSortFilterControlls({
  sortField,
  sortOrder,
  filterNotConnected,
  isFetching,
  onSortChange,
  onFilterChange,
}: ImagesSortFilterControllsProps) {
  const toggleOrder = async (field: ImageSortField) => {
    if (sortField === field) {
      await onSortChange(
        field,
        sortOrder === ImageSortOrder.ASC
          ? ImageSortOrder.DESC
          : ImageSortOrder.ASC,
      );
    } else {
      await onSortChange(field, ImageSortOrder.DESC);
    }
  };

  return (
    <div className="mb-4 flex flex-col items-center justify-between gap-2 rounded-sm sm:flex-row">
      <div className="flex w-full items-center space-x-2 sm:justify-start">
        <div className="flex h-8 w-full items-center justify-start gap-2 text-nowrap rounded-sm border-[1px] border-input bg-muted px-1 hover:bg-transparent sm:w-[154px]">
          <Switch
            size={"big"}
            variant={"secondary"}
            id="filter-not-connected"
            checked={filterNotConnected}
            onCheckedChange={onFilterChange}
          />
          <Label
            className="cursor-pointer text-base"
            htmlFor="filter-not-connected"
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
            sortField === ImageSortField.UPLOAD_DATE &&
              "border-[1px] border-secondary text-foreground",
          )}
          onClick={() => toggleOrder(ImageSortField.UPLOAD_DATE)}
        >
          <div className="flex gap-2">
            <UploadCloud className="h-6 w-5" />
            Upload Date
          </div>
          {isFetching && sortField === ImageSortField.UPLOAD_DATE ? (
            <Loader2 className="h-6 w-5 animate-spin text-secondary" />
          ) : (
            sortField === ImageSortField.UPLOAD_DATE &&
            (sortOrder === ImageSortOrder.DESC ? (
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
            sortField === ImageSortField.CAPTURE_DATE &&
              "border-[1px] border-secondary text-foreground",
          )}
          onClick={() => toggleOrder(ImageSortField.CAPTURE_DATE)}
        >
          <div className="flex gap-2">
            <Camera className="h-6 w-5" />
            Capture Date
          </div>
          {isFetching && sortField === ImageSortField.CAPTURE_DATE ? (
            <Loader2 className="h-6 w-5 animate-spin text-secondary" />
          ) : (
            sortField === ImageSortField.CAPTURE_DATE &&
            (sortOrder === ImageSortOrder.DESC ? (
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
