"use client";

// src/components/features/Photos/photo-card.tsx:
import * as React from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  EditIcon,
  ExternalLinkIcon,
  FileIcon,
  Flower2Icon,
  MessageSquareTextIcon,
  TagsIcon,
  Trash2Icon,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { modulePaths } from "~/assets/constants";
import { useImageModal } from "~/components/Layouts/photo-modal-provider";
import { RESPONSIVE_IMAGE_SIZES } from "~/components/Layouts/responsive-grid";
import { ActionItem, ActionsMenu } from "~/components/atom/actions-menu";
import AvatarCardHeader from "~/components/atom/avatar-card-header";
import { DeleteConfirmationDialog } from "~/components/atom/confirm-delete";
import { SocialCardFooter } from "~/components/atom/social-card-footer";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { Comments } from "~/components/features/Comments/comments";
import { PostFormModal } from "~/components/features/Timeline/Post/post-form-modal";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useComments } from "~/hooks/use-comments";
import { useLikeStatus } from "~/hooks/use-likes";
import { Link, useRouter } from "~/lib/i18n/routing";
import { cn, formatDate, formatTime } from "~/lib/utils";
import type { GetOwnPhotoType } from "~/server/api/root";
import { useTRPC } from "~/trpc/client";
import { CommentableEntityType } from "~/types/comment";
import { PhotosSortField } from "~/types/image";
import { LikeableEntityType } from "~/types/like";
import { Locale } from "~/types/locale";
import { PostableEntityType } from "~/types/post";
import { UserRoles } from "~/types/user";

interface PhotoCardProps {
  photo: GetOwnPhotoType;
  isSocial?: boolean;
  currentQuery?: {
    page: number;
    sortField: PhotosSortField;
    sortOrder: SortOrder;
    filterNotConnected: boolean;
  };
}

export function PhotoCard({
  photo,
  isSocial: isSocialProp = true,
  currentQuery,
}: PhotoCardProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const user = session?.user;
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tCommon = useTranslations("Platform");
  const t = useTranslations("Photos");

  const { isLiked, likeCount, isLoading } = useLikeStatus(
    photo.id,
    LikeableEntityType.Photo,
  );

  const { commentCount, commentCountLoading, isCommentsOpen, toggleComments } =
    useComments(photo.id, CommentableEntityType.Photo);

  const [isSocial, setIsSocial] = React.useState(isSocialProp);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = React.useState(false);

  // Initialize delete mutation using Tanstack Query
  const deleteMutation = useMutation(
    trpc.photos.deletePhoto.mutationOptions({
      onSuccess: async () => {
        toast(t("DeleteConfirmation.toasts.success.title"), {
          description: t("DeleteConfirmation.toasts.success.description"),
        });
        // Invalidate queries to refresh the list
        await queryClient.invalidateQueries({
          queryKey: [["photos", "getOwnPhotos"]],
        });
        router.refresh();
      },
      onError: (error) => {
        toast.error(t("DeleteConfirmation.toasts.error.title"), {
          description:
            error.message || t("DeleteConfirmation.toasts.error.description"),
        });
      },
    }),
  );

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (photo.posts.length > 0) {
      toast.warning(
        t("DeleteConfirmation.toasts.warning-photo-has-posts.title"),
        {
          description: t(
            "DeleteConfirmation.toasts.warning-photo-has-posts.description",
          ),
        },
      );
      setIsDeleteDialogOpen(false);
      return;
    }
    await deleteMutation.mutateAsync({ id: photo.id });
    setIsDeleteDialogOpen(false);
  };

  const { openImageModal } = useImageModal();
  const [isImageHovered, setIsImageHovered] = React.useState(false);

  const handleImageClick = () => {
    openImageModal(photo.imageUrl);
  };

  // Get the current search parameters string to preserve state
  const currentUrlParamsString = searchParams ? searchParams.toString() : "";
  // Encode the entire string to be safely passed as a query parameter value
  const returnToQuery = currentUrlParamsString
    ? `?returnTo=${encodeURIComponent(currentUrlParamsString)}`
    : "";

  // Memoized actions array
  const actions = React.useMemo((): ActionItem[] => {
    if (!user) return [];

    const actions: ActionItem[] = [];

    // Public Link - Always show for owner
    if (user.id === photo.ownerId) {
      actions.push({
        icon: ExternalLinkIcon,
        label: t(`public-link-label`),
        onClick: () => {
          window.open(`/public/photos/${photo.id}`, "_blank");
        },
        variant: "ghost",
      });
    }

    // Edit Action - Only for owner
    if (user.id === photo.ownerId) {
      actions.push({
        icon: EditIcon,
        label: t("edit-button-label"),
        onClick: () => {
          router.push(
            `${modulePaths.PHOTOS.path}/${photo.id}/form${returnToQuery}`,
          );
        },
        variant: "ghost",
      });
    }

    // Delete Action - For owner and admin
    if (user.id === photo.ownerId || user.role === UserRoles.ADMIN) {
      actions.push({
        icon: Trash2Icon,
        label: t("delete-button-label"),
        onClick: handleDelete,
        variant: "destructive",
        disabled: deleteMutation.isPending,
      });
    }

    return actions;
  }, [
    user,
    photo.ownerId,
    photo.id,
    t,
    router,
    returnToQuery,
    deleteMutation.isPending,
  ]);

  const dateElement = (
    <Link
      href={`/public${modulePaths.PHOTOS.path}/${photo.id}`}
      title={tCommon("updated-at")}
      className="text-muted-foreground flex items-center gap-1 text-sm whitespace-nowrap underline-offset-3 hover:underline"
    >
      {formatDate(photo.updatedAt, locale as Locale, { includeYear: false })}{" "}
      {formatTime(photo.updatedAt, locale as Locale)}
    </Link>
  );

  return (
    <>
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
          `border-input relative flex flex-col gap-0 overflow-hidden rounded-md border py-0 shadow-none`,
          isSocial && "border-none",
        )}
      >
        {/* "NEW" Banner */}
        {!isSocial && !!!photo.plantImages.length && (
          <div className="bg-secondary absolute top-[12px] left-[-36px] z-5 h-5 w-[110px] rotate-[-45deg] cursor-default px-[40px] py-[1px] text-[14px] font-semibold tracking-widest text-white">
            {t("newNotConnteched")}
          </div>
        )}

        {/* Card Header */}
        <CardHeader
          className={cn(
            "flex items-center justify-between pb-0",
            !isSocial && "p-2",
            isSocial && "px-0 pb-1",
          )}
        >
          {isSocial ? (
            <AvatarCardHeader
              user={photo.owner}
              dateElement={dateElement}
              actions={actions}
              showActions={actions.length > 0}
            />
          ) : (
            <div className="flex w-full min-w-0 items-center justify-between gap-2">
              {/* Title Link */}
              <CardTitle as="h3" className="min-w-0 flex-1">
                <Button
                  asChild
                  variant="link"
                  className="text-primary decoration-primary flex min-w-0 items-center justify-start gap-2 px-0"
                >
                  <Link
                    href={`/public${modulePaths.PHOTOS.path}/${photo.id}`}
                    className="flex min-w-0 items-center gap-2"
                  >
                    <FileIcon className="flex-shrink-0" size={24} />
                    <span className="truncate text-xl leading-normal font-semibold">
                      {photo.originalFilename}
                    </span>
                  </Link>
                </Button>
              </CardTitle>

              {/* Replace OwnerDropdownMenu with ActionsMenu */}
              {user && user.id === photo.ownerId && actions.length > 0 && (
                <div className="w-8 flex-none">
                  <ActionsMenu actions={actions} />
                </div>
              )}
            </div>
          )}
        </CardHeader>

        {/* Card Content */}
        <CardContent className={cn(isSocial && "ml-12 pr-2 pl-0")}>
          {/* Photo Upload and Capture Dates */}
          <TooltipProvider>
            <div className="mb-2 flex flex-col text-sm">
              <Tooltip>
                <TooltipTrigger asChild>
                  <p
                    className={cn(
                      "flex items-center gap-2 px-1",
                      currentQuery &&
                        currentQuery.sortField === PhotosSortField.UPLOAD_DATE
                        ? "text-secondary"
                        : "text-muted-foreground/60",
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
                        : "text-muted-foreground/60",
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

          {/* Plant Badges */}
          <CardDescription className="mt-2">
            <div className="custom-scrollbar flex min-h-8 items-center gap-2 overflow-x-auto px-1">
              {photo.plantImages
                .sort((a, b) => a.plant.name.localeCompare(b.plant.name))
                .map((plantImage) => (
                  <Link
                    key={plantImage.plant.id}
                    href={`/public/plants/${plantImage.plant.id}`}
                  >
                    <Badge
                      variant="plant"
                      className="flex max-w-32 items-center gap-1 overflow-hidden rounded-sm text-ellipsis whitespace-nowrap"
                    >
                      <Flower2Icon className="h-4 w-4 shrink-0" />

                      <span className="overflow-hidden text-left text-ellipsis">
                        {plantImage.plant.name}
                      </span>
                    </Badge>
                  </Link>
                ))}
            </div>
          </CardDescription>
        </CardContent>

        {/* Card Footer */}
        <CardFooter className={cn("flex-col p-2 pt-0", isSocial && "ml-12")}>
          {!isSocial && (
            <>
              {!!photo.plantImages.length ? (
                <Button
                  size={"sm"}
                  variant="primary"
                  className="group flex w-full transform items-center gap-2 rounded-sm p-2 font-semibold transition-all hover:translate-y-[-1px] hover:shadow-md"
                  onClick={() => setIsPostModalOpen(true)}
                >
                  <MessageSquareTextIcon
                    size={20}
                    className="transition-transform duration-300 group-hover:scale-110"
                  />
                  <span className="transition-colors duration-300">
                    {t("button-label-post-update")}
                  </span>
                </Button>
              ) : (
                <Button
                  asChild
                  size={"sm"}
                  variant={"secondary"}
                  className="w-full p-2 font-semibold"
                >
                  {/* Navigate with the encoded returnTo parameter */}
                  <Link
                    href={`${modulePaths.PHOTOS.path}/${photo.id}/form${returnToQuery}`}
                  >
                    <TagsIcon size={20} />
                    {t("button-label-connect-plants")}
                  </Link>
                </Button>
              )}
            </>
          )}

          {isSocial && (
            <SocialCardFooter
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
        </CardFooter>

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
