// src/components/ui/delete-confirmation-dialog.tsx
import { Trash2, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

import SpinningLoader from "../Layouts/loader";

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
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        {alertCautionText && (
          <Alert variant="destructive">
            <AlertTitle className="items-gap-1 center flex gap-1 font-semibold text-foreground">
              <TriangleAlert className="h-8 w-8 text-yellow-400" />
            </AlertTitle>
            <AlertDescription className="text-destructive">
              {alertCautionText}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="gap-3 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            autoFocus={false}
          >
            {t("Cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirmDelete}
            disabled={isDeleting}
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
