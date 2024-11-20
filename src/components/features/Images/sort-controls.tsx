import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Camera,
  UploadCloud,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { ImageSortField, SortOrder } from "~/types/image";

interface SortControlsProps {
  sortField: ImageSortField;
  sortOrder: SortOrder;
  onSortChange: (field: ImageSortField, order: SortOrder) => Promise<void>;
}

export default function ImageSortControls({
  sortField,
  sortOrder,
  onSortChange,
}: SortControlsProps) {
  const toggleOrder = async (field: ImageSortField) => {
    if (sortField === field) {
      // Toggle order if clicking the same field
      await onSortChange(
        field,
        sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC,
      );
    } else {
      // Default to DESC when switching fields
      await onSortChange(field, SortOrder.DESC);
    }
  };

  return (
    <div className="mb-2 flex w-full items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "flex w-32 items-center justify-start gap-1 p-2 hover:bg-secondary",
          sortField === ImageSortField.CREATED_AT && "text-secondary",
        )}
        onClick={() => toggleOrder(ImageSortField.CREATED_AT)}
      >
        <UploadCloud className="h-4 w-4" />
        Upload Date
        {sortField === ImageSortField.CREATED_AT &&
          (sortOrder === SortOrder.DESC ? (
            <ArrowDownWideNarrow className="h-4 w-4" />
          ) : (
            <ArrowUpNarrowWide className="h-4 w-4" />
          ))}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "flex w-32 items-center justify-start gap-1 p-2 hover:bg-secondary",
          sortField === ImageSortField.CAPTURE_DATE && "text-secondary",
        )}
        onClick={() => toggleOrder(ImageSortField.CAPTURE_DATE)}
      >
        <Camera className="h-4 w-4" />
        Capture Date
        {sortField === ImageSortField.CAPTURE_DATE &&
          (sortOrder === SortOrder.DESC ? (
            <ArrowDownWideNarrow className="h-4 w-4" />
          ) : (
            <ArrowUpNarrowWide className="h-4 w-4" />
          ))}
      </Button>
    </div>
  );
}
