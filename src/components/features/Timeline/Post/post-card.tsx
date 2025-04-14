import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { ChevronLeft, ChevronRight, DotIcon } from "lucide-react";
import { toast } from "sonner";
import { useImageModal } from "~/components/Layouts/photo-modal-provider";
import AvatarCardHeader from "~/components/atom/avatar-card-header";
import { DeleteConfirmationDialog } from "~/components/atom/confirm-delete";
import { SocialCardFooter } from "~/components/atom/social-card-footer";
import { Comments } from "~/components/features/Comments/comments";
import { EmbeddedGrowCard } from "~/components/features/Grows/embedded-grow-card";
import { EnhancedPlantCard } from "~/components/features/Plants/enhanced-plant-card.tsx";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { useComments } from "~/hooks/use-comments";
import { useLikeStatus } from "~/hooks/use-likes";
import { api } from "~/lib/trpc/react";
import { cn, formatDate, formatTime } from "~/lib/utils";
import { GetPostType } from "~/server/api/root";
import { CommentableEntityType } from "~/types/comment";
import { LikeableEntityType } from "~/types/like";
import { Locale } from "~/types/locale";
import { PostableEntityType } from "~/types/post";

interface PostCardProps {
  post: GetPostType;
  isSocialProp?: boolean;
}

export default function PostCard({ post, isSocialProp = true }: PostCardProps) {
  const utils = api.useUtils();
  const locale = useLocale();

  const t = useTranslations("Posts");
  const { openImageModal } = useImageModal();
  const [isImageHovered, setIsImageHovered] = React.useState(false);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSocial, setIsSocial] = React.useState(isSocialProp);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const {
    isLiked,
    likeCount,
    isLoading: isLikeLoading,
  } = useLikeStatus(post.id, LikeableEntityType.Post);

  const { commentCount, commentCountLoading, isCommentsOpen, toggleComments } =
    useComments(post.id, CommentableEntityType.Post);

  // Initialize delete mutation
  const deleteMutation = api.updates.deleteById.useMutation({
    onSuccess: async () => {
      toast("Success", {
        description: t("post-deleted-successfully"),
      });
      await utils.updates.getAll.invalidate();
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || t("error-default"),
      });
    },
  });

  const confirmDelete = async () => {
    await deleteMutation.mutateAsync({ id: post.id });
    setIsDeleteDialogOpen(false);
  };

  const handleImageClick = (index: number) => {
    // If we have postImages, use those
    if (post.postImages && post.postImages.length > 0) {
      openImageModal(post.postImages[index].image.imageUrl);
    }
    // Otherwise, use the original single photo
    else if (post.entityType === PostableEntityType.PHOTO) {
      openImageModal(post.photo.imageUrl);
    }
  };

  const navigateImages = (direction: "next" | "prev", e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.postImages && post.postImages.length > 0) {
      if (direction === "next") {
        setCurrentImageIndex((current) =>
          current < post.postImages.length - 1 ? current + 1 : 0,
        );
      } else {
        setCurrentImageIndex((current) =>
          current > 0 ? current - 1 : post.postImages.length - 1,
        );
      }
    }
  };

  const dateElement = (
    <div
      title={t("post-card-createdAt")}
      className="text-muted-foreground flex cursor-default items-center gap-2 text-sm whitespace-nowrap"
    >
      {<DotIcon size={24} className="xs:block -mx-2 hidden" />}
      {formatDate(post.createdAt, locale as Locale)}{" "}
      {formatTime(post.createdAt, locale as Locale)}
    </div>
  );

  // Determine if the post has multiple images
  const hasMultipleImages = post.postImages && post.postImages.length > 1;

  return (
    <>
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={confirmDelete}
        isDeleting={deleteMutation.isPending}
        title="Are you sure you want to remove this post?"
        description="This action cannot be undone!"
      />
      <Card
        className={cn(
          `border-input flex flex-col gap-0 overflow-hidden border py-0`,
          // isSocial && "border-none",
        )}
      >
        {isSocial && (
          <AvatarCardHeader user={post.owner} dateElement={dateElement} />
        )}

        <CardContent
          className={`flex h-full flex-col gap-2 ${isSocial ? "ml-12 pr-2 pl-0" : "p-2"}`}
        >
          <p>{post.content}</p>

          {post.entityType === PostableEntityType.GROW && (
            <EmbeddedGrowCard grow={post.grow} />
          )}
          {post.entityType === PostableEntityType.PLANT && (
            <EnhancedPlantCard plant={post.plant} />
          )}

          {/* Display the main entity photo (legacy) */}
          {post.entityType === PostableEntityType.PHOTO &&
            !hasMultipleImages && (
              <div
                className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-md"
                onClick={() => handleImageClick(0)}
                onMouseEnter={() => setIsImageHovered(true)}
                onMouseLeave={() => setIsImageHovered(false)}
              >
                <Image
                  src={post.photo.imageUrl}
                  alt={post.photo.originalFilename}
                  fill
                  className="object-cover transition-transform duration-300"
                  sizes="100vw, (min-width: 768px) 75vw, (min-width: 1024) 720px"
                  style={{
                    transform: isImageHovered ? "scale(1.02)" : "scale(1)",
                  }}
                />
              </div>
            )}

          {/* Display post images from the many-to-many relationship */}
          {post.postImages && post.postImages.length > 0 && (
            <div
              className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-md"
              onClick={() => handleImageClick(currentImageIndex)}
              onMouseEnter={() => setIsImageHovered(true)}
              onMouseLeave={() => setIsImageHovered(false)}
            >
              <Image
                src={post.postImages[currentImageIndex].image.imageUrl}
                alt={
                  post.postImages[currentImageIndex].image.originalFilename ||
                  "Post image"
                }
                fill
                className="object-cover transition-transform duration-300"
                sizes="100vw, (min-width: 768px) 75vw, (min-width: 1024) 720px"
                style={{
                  transform: isImageHovered ? "scale(1.02)" : "scale(1)",
                }}
              />

              {/* Image navigation if multiple images */}
              {hasMultipleImages && (
                <>
                  <Button
                    variant="ghost"
                    className="absolute top-1/2 left-2 h-8 w-8 -translate-y-1/2 rounded-full bg-black/50 p-0 text-white hover:bg-black/80"
                    onClick={(e) => navigateImages("prev", e)}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 rounded-full bg-black/50 p-0 text-white hover:bg-black/80"
                    onClick={(e) => navigateImages("next", e)}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                    {post.postImages.map((_, index: number) => (
                      <div
                        key={index}
                        className={cn(
                          "h-2 w-2 rounded-full bg-white/70",
                          currentImageIndex === index && "bg-white",
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>

        {isSocial && (
          <SocialCardFooter
            className={`${isSocial && "ml-12"}`}
            entityId={post.id}
            entityType={LikeableEntityType.Post}
            initialLiked={isLiked}
            isLikeStatusLoading={isLikeLoading}
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
            entityId={post.id}
            entityType={CommentableEntityType.Post}
            isSocial={isSocial}
          />
        )}
      </Card>
    </>
  );
}
