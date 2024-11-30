// src/components/ui/delete-confirmation-dialog.tsx
import { InfoIcon, Loader2, Trash2 } from "lucide-react";
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

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => Promise<void>;
  isDeleting: boolean;
  title?: string;
  description?: string;
  importantInfo?: string;
}

export function DeleteConfirmationDialog({
  isOpen,
  onOpenChange,
  onConfirmDelete,
  isDeleting,
  title = "Are you sure you want to delete this item?",
  description = "This action cannot be undone. This will permanently delete the item from our servers.",
  importantInfo,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {importantInfo && (
          <Alert className="p-4">
            <InfoIcon className="h-5 w-5" />
            <AlertTitle>Important!</AlertTitle>
            <AlertDescription>{importantInfo}</AlertDescription>
          </Alert>

          //   <div className="flex items-center rounded-md border border-primary/20 bg-primary/10 p-3 text-primary">
          //     <InfoIcon className="mr-3 h-5 w-5 flex-shrink-0 text-primary" />
          //     <span className="text-sm">{additionalInfo}</span>
          //   </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-1 h-4 w-4" />
            )}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
