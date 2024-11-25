"use client";

import {
  Camera,
  Flower2,
  Loader2,
  Maximize,
  Minimize,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
import { GetOwnImageOutput } from "~/server/api/root";
import { ImageSortField } from "~/types/image";

interface PhotoCardProps {
  image: GetOwnImageOutput;
  sortField: ImageSortField;
}

export default function PhotoCard({ image, sortField }: PhotoCardProps) {
  const locale = useLocale();
  const router = useRouter();
  const utils = api.useUtils();

  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUnrestrictedView, setIsUnrestrictedView] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Initialize delete mutation
  const deleteMutation = api.image.deleteImage.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
      // Invalidate the images query to refresh the list
      utils.image.getOwnImages.invalidate();
      // Optionally redirect or refresh the page
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

  const confirmDelete = () => {
    deleteMutation.mutate({ id: image.id });
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
      <Card className="overflow-hidden">
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
                  sortField === ImageSortField.UPLOAD_DATE
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
                  sortField === ImageSortField.CAPTURE_DATE
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
        <CardFooter className="gap-2 p-3">
          <Button
            variant="destructive"
            size="sm"
            className="w-1/3 gap-0 text-sm font-bold"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                <Trash2 className="mr-1 h-4 w-4" />
              </>
            )}
            Delete
          </Button>
          <Button asChild size={"sm"} className="w-2/3 text-base font-semibold">
            <Link href={`images/${image.id}/identify-plants`}>
              <Flower2 strokeWidth={1.8} className="h-4 w-4" />
              Identify Plants
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this image?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              image from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
