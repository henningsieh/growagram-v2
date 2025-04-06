// src/components/ui/delete-confirmation-dialog.tsx
import { useTranslations } from "next-intl";
import { AlertTriangle, Trash2 } from "lucide-react";
import SpinningLoader from "~/components/atom/spinning-loader";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => Promise<void>;
  isDeleting: boolean;
  title?: string;
  description?: string;
  alertCautionText?: string;
}

export function DeleteConfirmationDialog({
  isOpen,
  onOpenChange,
  onConfirmDelete,
  isDeleting,
  title = "Are you sure you want to remove this item?",
  description = "This action cannot be undone!",
  alertCautionText,
}: DeleteConfirmationDialogProps) {
  const t = useTranslations("Platform");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex justify-between gap-1 border-b p-4">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>

        {alertCautionText && (
          <div className="border-destructive bg-destructive/10 m-2 border-l-4 p-2">
            <div className="flex gap-3">
              <AlertTriangle className="text-destructive h-5 w-5 shrink-0" />
              <p className="text-destructive text-sm">{alertCautionText}</p>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-row items-center justify-end gap-2 p-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            autoFocus={false}
            className="h-9"
          >
            {t("Cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirmDelete}
            disabled={isDeleting}
            className={cn("h-9", isDeleting && "cursor-not-allowed opacity-50")}
          >
            {isDeleting ? (
              <SpinningLoader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            {t("Delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
