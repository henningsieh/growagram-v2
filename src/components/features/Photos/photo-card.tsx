"use client";

// src/components/features/Photos/photo-card.tsx:
import {
  Camera,
  FileIcon,
  Flower2Icon,
  Maximize,
  Minimize,
  UploadCloud,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { RESPONSIVE_IMAGE_SIZES } from "~/components/Layouts/responsive-grid";
import AvatarCardHeader from "~/components/atom/avatar-card-header";
import { DeleteConfirmationDialog } from "~/components/atom/confirm-delete";
import { OwnerDropdownMenu } from "~/components/atom/owner-dropdown-menu";
import { SocialCardFooter } from "~/components/atom/social-card-footer";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useComments } from "~/hooks/use-comments";
import { useLikeStatus } from "~/hooks/use-likes";
import { useToast } from "~/hooks/use-toast";
import { Link, useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import { cn, formatDate, formatTime } from "~/lib/utils";
import { GetOwnPhotoType } from "~/server/api/root";
import { CommentableEntityType } from "~/types/comment";
import { PhotosSortField } from "~/types/image";
import { LikeableEntityType } from "~/types/like";

import { Comments } from "../Comments/comments";

interface PhotoCardProps {
  photo: GetOwnPhotoType;
  isSocial: boolean;
  currentQuery?: {
    page: number;
    sortField: PhotosSortField;
    sortOrder: SortOrder;
    filterNotConnected: boolean;
  };
}

export default function PhotoCard({
  photo,
  isSocial: isSocialProp,
  currentQuery,
}: PhotoCardProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const locale = useLocale();
  const router = useRouter();
  const utils = api.useUtils();
  const { toast } = useToast();

  const { isLiked, likeCount, isLoading } = useLikeStatus(
    photo.id,
    LikeableEntityType.Photo,
  );

  const { commentCount, commentCountLoading, isCommentsOpen, toggleComments } =
    useComments(photo.id, CommentableEntityType.Photo);

  const [isSocial, setIsSocial] = useState(isSocialProp);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUnrestrictedView, setIsUnrestrictedView] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Initialize delete mutation
  const deleteMutation = api.photos.deletePhoto.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
      // Invalidate and prefetch the images query to refresh the list
      await utils.photos.getOwnPhotos.invalidate();
      await utils.photos.getOwnPhotos.prefetch();

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
    await deleteMutation.mutateAsync({ id: photo.id });
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
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={confirmDelete}
        isDeleting={deleteMutation.isPending}
        title="Are you sure you want to delete this photo?"
        description="No plant will be deleted by this action!"
        alertCautionText="This action cannot be undone. This will permanently delete the photo from our cloud storage servers."
      />
      <Card className="relative my-2 flex flex-col overflow-hidden">
        {/* "NEW" Banner */}
        {!!!photo.plantImages.length && (
          <div className="absolute right-[-40px] top-[15px] z-10 w-[120px] rotate-[45deg] cursor-default bg-secondary px-[40px] py-[1px] text-[12px] font-semibold tracking-widest text-white">
            NEW
          </div>
        )}

        {isSocial && <AvatarCardHeader user={photo.owner} />}

        {/* Photo */}
        <div
          className="relative aspect-video cursor-pointer"
          onClick={handleImageClick}
          onMouseEnter={() => setIsImageHovered(true)}
          onMouseLeave={() => setIsImageHovered(false)}
        >
          <Image
            src={photo.imageUrl}
            alt={photo.originalFilename}
            fill
            priority
            className="object-contain transition-transform duration-300"
            sizes={RESPONSIVE_IMAGE_SIZES}
            style={{
              transform: isImageHovered ? "scale(1.02)" : "scale(1)",
            }}
          />
        </div>

        <CardContent
          className={`grid gap-2 ${isSocial ? "ml-12 pl-0 pr-2" : "p-2"}`}
        >
          {/* Title Link and OwnerDropdownMenu */}
          <div className="grid grid-cols-[1fr,auto] items-center gap-2">
            <CardTitle as="h2" className="min-w-0 overflow-hidden text-lg">
              <Button asChild variant="link" className="h-9 p-0">
                <Link
                  href={`/public/photos/${photo.id}`}
                  className="flex items-center gap-2"
                >
                  <FileIcon className="flex-shrink-0" size={20} />
                  <div className="truncate font-mono font-bold">
                    {photo.originalFilename}
                  </div>
                </Link>
              </Button>
            </CardTitle>
            {user && user.id === photo.ownerId && (
              <div className="w-8 flex-none">
                <OwnerDropdownMenu
                  isSocial={isSocial}
                  setIsSocial={setIsSocial}
                  isDeleting={deleteMutation.isPending}
                  handleDelete={handleDelete}
                  entityId={photo.id}
                  entityType="Photos"
                />
              </div>
            )}
          </div>

          {/* Plant Badges */}
          <div className="flex justify-end gap-2 p-0">
            {photo.plantImages.map((plantImage) => (
              <Link
                key={plantImage.plant.id}
                href={`/public/plants/${plantImage.plant.id}`}
              >
                <Badge
                  variant="default"
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                  <Flower2Icon className="h-4 w-4" />
                  {plantImage.plant.name}
                </Badge>
              </Link>
            ))}
          </div>

          {/* Photo Upload and Capture Date */}
          <TooltipProvider>
            <div className="flex flex-col text-sm">
              <Tooltip>
                <TooltipTrigger asChild>
                  <p
                    className={cn(
                      "flex items-center gap-2 px-1",
                      currentQuery &&
                        currentQuery.sortField === PhotosSortField.UPLOAD_DATE
                        ? "text-secondary"
                        : "text-accent-foreground",
                    )}
                  >
                    <UploadCloud size={20} />
                    {formatDate(photo.createdAt, locale)}
                    {locale !== "en" ? " um " : " at "}
                    {formatTime(photo.createdAt, locale)}
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
                      currentQuery &&
                        currentQuery.sortField === PhotosSortField.CAPTURE_DATE
                        ? "text-secondary"
                        : "text-accent-foreground",
                    )}
                  >
                    <Camera size={20} />
                    {formatDate(photo.captureDate, locale)}
                    {locale !== "en" ? " um " : " at "}
                    {formatTime(photo.captureDate, locale)}
                    {locale !== "en" && " Uhr"}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Capture Date (EXIF data)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </CardContent>

        {isSocial ? (
          <SocialCardFooter
            className={`pb-2 pr-2 ${isSocial && "ml-12"}`}
            entityId={photo.id}
            entityType={LikeableEntityType.Photo}
            initialLiked={isLiked}
            isLikeStatusLoading={isLoading}
            commentCountLoading={commentCountLoading}
            stats={{
              comments: commentCount,
              views: 0,
              likes: likeCount,
            }}
            toggleComments={toggleComments}
          />
        ) : undefined}

        {isSocial && isCommentsOpen && (
          <Comments
            entityId={photo.id}
            entityType={CommentableEntityType.Photo}
            isSocial={isSocial}
          />
        )}
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
                <X size={20} />
              </Button>

              <div
                className="fixed left-1/2 top-2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-sm bg-secondary bg-opacity-50 p-1 text-white"
                onClick={handleSwitchContainerClick}
              >
                <div
                  title="contain"
                  onClick={() => setIsUnrestrictedView(false)}
                >
                  <Minimize size={20} />
                </div>
                <Switch
                  title="Toggle contain/zoom"
                  checked={isUnrestrictedView}
                  onCheckedChange={toggleViewMode}
                  aria-label="Toggle view mode"
                />
                <div title="zoom" onClick={() => setIsUnrestrictedView(true)}>
                  <Maximize size={20} />
                </div>
              </div>
              <div className="relative -z-30 flex h-full items-center justify-center bg-zinc-900/95">
                <Image
                  src={photo.imageUrl}
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
    </>
  );
}
