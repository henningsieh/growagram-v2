// src/components/features/Photos/photo-card.tsx:
import {
  Camera,
  Edit,
  Flower2,
  Loader2,
  Maximize,
  Minimize,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DeleteConfirmationDialog } from "~/components/atom/confirm-delete";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Switch } from "~/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useToast } from "~/hooks/use-toast";
import { Link } from "~/lib/i18n/routing";
import { useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import { cn, formatDate, formatTime } from "~/lib/utils";
import { GetOwnImageType } from "~/server/api/root";
import { PhotosSortField } from "~/types/image";

interface PhotoCardProps {
  image: GetOwnImageType;
  sortField: PhotosSortField;
  currentQuery: {
    page: number;
    sortField: PhotosSortField;
    sortOrder: SortOrder;
    filterNotConnected: boolean;
  };
}

export default function PhotoCard({
  image,
  sortField,
  currentQuery,
}: PhotoCardProps) {
  const locale = useLocale();
  const router = useRouter();
  const utils = api.useUtils();

  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUnrestrictedView, setIsUnrestrictedView] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Initialize delete mutation
  const deleteMutation = api.image.deleteImage.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
      // Invalidate and prefetch the images query to refresh the list
      await utils.image.getOwnImages.invalidate();
      await utils.image.getOwnImages.prefetch();

      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete image",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    await deleteMutation.mutateAsync({ id: image.id });
    setIsDeleteDialogOpen(false);
  };

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleModalClose();
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isModalOpen, handleModalClose]);

  const toggleViewMode = () => {
    setIsUnrestrictedView(!isUnrestrictedView);
  };

  const handleSwitchContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const [isImageHovered, setIsImageHovered] = useState(false);

  return (
    <>
      <Card className="relative overflow-hidden">
        {!!!image.plantImages.length && (
          <div className="absolute right-[-40px] top-[15px] z-10 w-[120px] rotate-[45deg] cursor-default bg-secondary px-[40px] py-[1px] text-[12px] font-semibold tracking-widest text-white">
            NEW
          </div>
        )}
        <div
          className="relative aspect-video cursor-pointer"
          onClick={handleImageClick}
          onMouseEnter={() => setIsImageHovered(true)}
          onMouseLeave={() => setIsImageHovered(false)}
        >
          <Image
            src={image.imageUrl}
            alt={image.originalFilename}
            fill
            priority
            className="object-contain transition-transform duration-300"
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
            style={{
              transform: isImageHovered ? "scale(1.05)" : "scale(1)",
            }}
          />
        </div>
        <CardTitle className="overflow-x-hidden whitespace-nowrap p-3 font-mono">
          {image.originalFilename}
        </CardTitle>
        <CardContent className="flex flex-col p-2 py-2 text-sm">
          <Tooltip>
            <TooltipTrigger asChild>
              <p
                className={cn(
                  "flex items-center gap-2 px-1",
                  sortField === PhotosSortField.UPLOAD_DATE
                    ? "text-secondary"
                    : "text-accent-foreground",
                )}
              >
                <UploadCloud size={18} />
                {formatDate(image.createdAt, locale)}
                {locale !== "en" ? " um " : " at "}
                {formatTime(image.createdAt, locale)}
                {locale !== "en" && " Uhr"}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upload Date </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <p
                className={cn(
                  "flex items-center gap-2 px-1",
                  sortField === PhotosSortField.CAPTURE_DATE
                    ? "text-secondary"
                    : "text-accent-foreground",
                )}
              >
                <Camera size={18} />
                {formatDate(image.captureDate, locale)}
                {locale !== "en" ? " um " : " at "}
                {formatTime(image.captureDate, locale)}
                {locale !== "en" && " Uhr"}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p>Capture Date (EXIF data)</p>
            </TooltipContent>
          </Tooltip>
        </CardContent>

        <CardFooter className="flex w-full gap-1 p-2">
          <Button
            variant="destructive"
            size={"sm"}
            className="w-14"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Trash2 size={20} />
            )}
          </Button>
          <Button
            asChild
            size={"sm"}
            className="w-full"
            variant={!!!image.plantImages.length ? "primary" : "outline"}
          >
            <Link
              href={{
                pathname: `/photos/${image.id}/identify-plants`,
                query: currentQuery,
              }}
            >
              {!!!image.plantImages.length ? (
                <Search size={20} />
              ) : (
                <Flower2 size={20} />
              )}
              {!!!image.plantImages.length ? "Select Plants" : "Edit Plants"}
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {isModalOpen &&
        createPortal(
          <div
            className={`fixed inset-0 z-50 ${isUnrestrictedView ? "overflow-auto" : "overflow-hidden"}`}
            onClick={handleModalClose}
          >
            <div
              className={`${isUnrestrictedView ? "min-h-screen min-w-full" : "h-screen w-screen"} p-0`}
            >
              <Button
                variant={"secondary"}
                onClick={handleModalClose}
                className="fixed right-4 top-2 z-10 h-6 p-1"
                aria-label="Close modal"
              >
                <X size={18} />
              </Button>

              <div
                className="fixed left-1/2 top-2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-sm bg-secondary bg-opacity-50 p-1 text-white"
                onClick={handleSwitchContainerClick}
              >
                <div
                  title="contain"
                  onClick={() => setIsUnrestrictedView(false)}
                >
                  <Minimize size={18} />
                </div>
                <Switch
                  title="Toggle contain/zoom"
                  checked={isUnrestrictedView}
                  onCheckedChange={toggleViewMode}
                  aria-label="Toggle view mode"
                />
                <div title="zoom" onClick={() => setIsUnrestrictedView(true)}>
                  <Maximize size={18} />
                </div>
              </div>
              <div className="relative -z-30 flex h-full items-center justify-center bg-zinc-900/95">
                <Image
                  src={image.imageUrl}
                  alt=""
                  width={1920}
                  height={1080}
                  className={`${
                    isUnrestrictedView
                      ? "max-w-none"
                      : "max-h-[90vh] max-w-[90vw] object-contain"
                  }`}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={confirmDelete}
        isDeleting={deleteMutation.isPending}
        title="Are you sure you want to delete this image?"
        description="This action cannot be undone. This will permanently delete the image from our servers."
      />
    </>
  );
}
