"use client";

// src/components/features/Photos/photo-card.tsx:
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import {
  Camera,
  FileIcon,
  Flower2Icon,
  MessageSquareTextIcon,
  TagsIcon,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { modulePaths } from "~/assets/constants";
import { RESPONSIVE_IMAGE_SIZES } from "~/components/Layouts/responsive-grid";
import AvatarCardHeader from "~/components/atom/avatar-card-header";
import { DeleteConfirmationDialog } from "~/components/atom/confirm-delete";
import { OwnerDropdownMenu } from "~/components/atom/owner-dropdown-menu";
import { SocialCardFooter } from "~/components/atom/social-card-footer";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { Comments } from "~/components/features/Comments/comments";
import { useImageModal } from "~/components/features/Photos/modal-provider";
import { PostFormModal } from "~/components/features/Timeline/Post/post-form-modal";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useComments } from "~/hooks/use-comments";
import { useLikeStatus } from "~/hooks/use-likes";
import { Link, useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import { cn, formatDate, formatTime } from "~/lib/utils";
import type { GetOwnPhotoType } from "~/server/api/root";
import { CommentableEntityType } from "~/types/comment";
import { PhotosSortField } from "~/types/image";
import { LikeableEntityType } from "~/types/like";
import { Locale } from "~/types/locale";
import { PostableEntityType } from "~/types/post";

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
  const t = useTranslations("Photos");

  const { isLiked, likeCount, isLoading } = useLikeStatus(
    photo.id,
    LikeableEntityType.Photo,
  );

  const { commentCount, commentCountLoading, isCommentsOpen, toggleComments } =
    useComments(photo.id, CommentableEntityType.Photo);

  const [isSocial, setIsSocial] = useState(isSocialProp);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // Initialize delete mutation
  const deleteMutation = api.photos.deletePhoto.useMutation({
    onSuccess: async () => {
      toast(t("DeleteConfirmation.toasts.success.title"), {
        description: t("DeleteConfirmation.toasts.success.description"),
      });
      // Invalidate and prefetch the images query to refresh the list
      await utils.photos.getOwnPhotos.invalidate();
      await utils.photos.getOwnPhotos.prefetch();

      router.refresh();
    },
    onError: (error) => {
      toast.error(t("DeleteConfirmation.toasts.error.title"), {
        description:
          error.message || t("DeleteConfirmation.toasts.error.description"),
      });
    },
  });

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (photo.posts.length > 0) {
      toast(t("DeleteConfirmation.toasts.warning-photo-has-posts.title"), {
        description: t(
          "DeleteConfirmation.toasts.warning-photo-has-posts.description",
        ),
      });
      setIsDeleteDialogOpen(false);
      return;
    }
    await deleteMutation.mutateAsync({ id: photo.id });
    setIsDeleteDialogOpen(false);
  };

  const { openImageModal } = useImageModal();
  const [isImageHovered, setIsImageHovered] = useState(false);

  const handleImageClick = () => {
    openImageModal(photo.imageUrl);
  };

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={confirmDelete}
        isDeleting={deleteMutation.isPending}
        title={t("DeleteConfirmation.title")}
        description={t("DeleteConfirmation.description")}
        alertCautionText={t("DeleteConfirmation.alertCautionText")}
      />
      <PostFormModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        entity={photo}
        entityType={PostableEntityType.PHOTO}
      />
      <Card
        className={cn(
          `border-input relative flex flex-col overflow-hidden border pt-1`,
          isSocial && "border-none",
        )}
      >
        {/* "NEW" Banner */}
        {!!!photo.plantImages.length && (
          <div className="bg-secondary absolute top-[15px] right-[-40px] z-10 w-[120px] rotate-[45deg] cursor-default px-[40px] py-[1px] text-[12px] font-semibold tracking-widest text-white">
            {t("newNotConnteched")}
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
          className={`grid gap-2 p-2 ${isSocial && "ml-12 pr-2 pl-0"}`}
        >
          {/* Title Link and OwnerDropdownMenu */}
          <div className="flex min-w-0 items-center justify-between gap-2">
            <CardTitle as="h3" className="min-w-0 flex-1">
              <Button
                asChild
                variant="link"
                className="w-full justify-start p-0"
              >
                <Link
                  href={`/public${modulePaths.PHOTOS.path}/${photo.id}`}
                  className="flex min-w-0 items-center gap-2"
                >
                  <FileIcon className="flex-shrink-0" size={20} />
                  <span className="truncate font-mono font-semibold">
                    {photo.originalFilename}
                  </span>
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
          <div className="custom-scrollbar flex min-h-8 gap-2 overflow-x-auto px-1 pb-2">
            {photo.plantImages
              .sort((a, b) => a.plant.name.localeCompare(b.plant.name))
              .map((plantImage) => (
                <Link
                  key={plantImage.plant.id}
                  href={`/public/plants/${plantImage.plant.id}`}
                >
                  <Badge
                    variant="plant"
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <Flower2Icon className="h-4 w-4" />
                    {plantImage.plant.name}
                  </Badge>
                </Link>
              ))}
          </div>

          {/* Photo Upload and Capture Dates */}
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
                    {formatDate(photo.createdAt, locale as Locale)}{" "}
                    {formatTime(photo.createdAt, locale as Locale)}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("uploaded-at")}</p>
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
                    {formatDate(photo.captureDate, locale as Locale)}{" "}
                    {formatTime(photo.captureDate, locale as Locale)}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("capture-date")}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          {!!photo.plantImages.length && !isSocial && (
            <Button
              size={"sm"}
              className="p-2 font-semibold"
              onClick={() => setIsPostModalOpen(true)}
            >
              <MessageSquareTextIcon size={20} />
              {t("button-label-post-update")}
            </Button>
          )}

          {!!!photo.plantImages.length && !isSocial && (
            // link to edit plant, same as in DropDown menu
            <Button
              asChild
              size={"sm"}
              variant={"secondary"}
              className="p-2 font-semibold"
            >
              <Link href={`${modulePaths.PHOTOS.path}/${photo.id}/form`}>
                <TagsIcon size={20} />
                {t("button-label-connect-plants")}
              </Link>
            </Button>
          )}
        </CardContent>

        {isSocial && (
          <SocialCardFooter
            className={`pr-2 pb-2 ${isSocial && "ml-12"}`}
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
        )}

        {isSocial && isCommentsOpen && (
          <Comments
            entityId={photo.id}
            entityType={CommentableEntityType.Photo}
            isSocial={isSocial}
          />
        )}
      </Card>
    </>
  );
}
