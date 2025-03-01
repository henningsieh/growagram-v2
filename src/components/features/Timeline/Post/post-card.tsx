import { DotIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import AvatarCardHeader from "~/components/atom/avatar-card-header";
import { DeleteConfirmationDialog } from "~/components/atom/confirm-delete";
import { SocialCardFooter } from "~/components/atom/social-card-footer";
import { Comments } from "~/components/features/Comments/comments";
import { EmbeddedGrowCard } from "~/components/features/Grows/embedded-grow-card";
import { useImageModal } from "~/components/features/Photos/modal-provider";
import { EnhancedPlantCard } from "~/components/features/Plants/enhanced-plant-card.tsx";
import { Card, CardContent } from "~/components/ui/card";
import { useComments } from "~/hooks/use-comments";
import { useLikeStatus } from "~/hooks/use-likes";
import { useToast } from "~/hooks/use-toast";
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
  const { toast } = useToast();
  const t = useTranslations("Posts");
  const { openImageModal } = useImageModal();
  const [isImageHovered, setIsImageHovered] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSocial, setIsSocial] = useState(isSocialProp);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      await utils.updates.getAll.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  // const handleDelete = () => {
  //   setIsDeleteDialogOpen(true);
  // };

  const confirmDelete = async () => {
    await deleteMutation.mutateAsync({ id: post.id });
    setIsDeleteDialogOpen(false);
  };

  const handleImageClick = () => {
    if (post.entityType === "image") {
      openImageModal(post.photo.imageUrl);
    }
  };

  const dateElement = (
    <div
      title={t("post-card-createdAt")}
      className="flex cursor-default items-center gap-2 whitespace-nowrap text-sm text-muted-foreground"
    >
      {<DotIcon size={24} className="-mx-2 hidden xs:block" />}
      {formatDate(post.createdAt, locale as Locale)}{" "}
      {formatTime(post.createdAt, locale as Locale)}
    </div>
  );

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
          `flex flex-col overflow-hidden border border-input pt-1`,
          // isSocial && "border-none",
        )}
      >
        {isSocial && (
          <AvatarCardHeader user={post.owner} dateElement={dateElement} />
        )}

        <CardContent
          className={`flex h-full flex-col gap-2 ${isSocial ? "ml-12 pl-0 pr-2" : "p-2"}`}
        >
          <p>{post.content}</p>

          {post.entityType === PostableEntityType.GROW && (
            <EmbeddedGrowCard grow={post.grow} />
          )}
          {post.entityType === PostableEntityType.PLANT && (
            <EnhancedPlantCard plant={post.plant} />
          )}
          {post.entityType === "image" && (
            <div
              className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-md"
              onClick={handleImageClick}
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
        </CardContent>

        {isSocial && (
          <SocialCardFooter
            className={`pb-2 pr-2 ${isSocial && "ml-12"}`}
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
