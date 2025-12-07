import * as React from "react";

import Image from "next/image";

import { useLocale, useTranslations } from "next-intl";

import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import { DotIcon } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "~/components/ui/card";

import { useImageModal } from "~/components/Layouts/photo-modal-provider";
import AvatarCardHeader from "~/components/atom/avatar-card-header";
import { DeleteConfirmationDialog } from "~/components/atom/confirm-delete";
import { SocialCardFooter } from "~/components/atom/social-card-footer";
import { Comments } from "~/components/features/Comments/comments";
import { EmbeddedGrowCard } from "~/components/features/Grows/embedded-grow-card";
import { EnhancedPlantCard } from "~/components/features/Plants/enhanced-plant-card.tsx";

import { GetPostType } from "~/server/api/root";

import { CommentableEntityType } from "~/types/comment";
import { LikeableEntityType } from "~/types/like";
import { Locale } from "~/types/locale";
import { PostableEntityType } from "~/types/post";

import { useTRPC } from "~/lib/trpc/client";
import { cn, formatDateTime } from "~/lib/utils";

import { useComments } from "~/hooks/use-comments";
import { useLikeStatus } from "~/hooks/use-likes";

interface PostCardProps {
  post: GetPostType;
  isSocialProp?: boolean;
}

export default function PostCard({ post, isSocialProp = true }: PostCardProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const locale = useLocale();

  const t = useTranslations("Posts");
  const { openImageModal } = useImageModal();
  const [isImageHovered, setIsImageHovered] = React.useState(false);

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
  const deleteMutation = useMutation(
    trpc.posts.deleteById.mutationOptions({
      onSuccess: async () => {
        toast("Success", {
          description: t("post-deleted-successfully"),
        });
        await queryClient.invalidateQueries(trpc.posts.getAll.pathFilter());
      },
      onError: (error) => {
        toast.error("Error", {
          description: error.message || t("error-default"),
        });
      },
    }),
  );

  // const handleDelete = () => {
  //   setIsDeleteDialogOpen(true);
  // };

  const confirmDelete = async () => {
    await deleteMutation.mutateAsync({ id: post.id });
    setIsDeleteDialogOpen(false);
  };

  const handleImageClick = () => {
    if (post.entityType === PostableEntityType.PHOTO) {
      openImageModal(post.photo.imageUrl);
    }
  };

  const dateElement = (
    <div
      title={t("post-card-createdAt")}
      className="text-muted-foreground flex cursor-default items-center gap-2 text-sm whitespace-nowrap"
    >
      {<DotIcon size={24} className="xs:block -mx-2 hidden" />}
      {formatDateTime(post.createdAt, locale as Locale)}
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
          {post.entityType === PostableEntityType.PHOTO && (
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
