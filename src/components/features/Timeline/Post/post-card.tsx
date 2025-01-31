import Image from "next/image";
import { useState } from "react";
import AvatarCardHeader from "~/components/atom/avatar-card-header";
import { DeleteConfirmationDialog } from "~/components/atom/confirm-delete";
import { SocialCardFooter } from "~/components/atom/social-card-footer";
import { useImageModal } from "~/components/features/Photos/modal-provider";
import { Card, CardContent } from "~/components/ui/card";
import { useComments } from "~/hooks/use-comments";
import { useLikeStatus } from "~/hooks/use-likes";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/lib/trpc/react";
import { cn } from "~/lib/utils";
import type { GetPostType } from "~/server/api/root";
import { CommentableEntityType } from "~/types/comment";
import { LikeableEntityType } from "~/types/like";
import { PostableEntityType } from "~/types/post";

import { Comments } from "../../Comments/comments";
import { EmbeddedGrowCard } from "../../Grows/embedded-grow-card";
import { EmbeddedPlantCard } from "../../Plants/embedded-plant-card";

interface PostCardProps {
  post: GetPostType;
  isSocialProp?: boolean;
}

export default function PostCard({ post, isSocialProp = true }: PostCardProps) {
  const utils = api.useUtils();
  const { toast } = useToast();
  const { openImageModal } = useImageModal();
  const [isImageHovered, setIsImageHovered] = useState(false);

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
  const deleteMutation = api.posts.deleteById.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      await utils.posts.getAll.invalidate();
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
          `flex flex-col overflow-hidden border border-input`,
          isSocial && "border-none",
        )}
      >
        {isSocial && (
          <AvatarCardHeader user={post.owner} date={post.createdAt} />
        )}

        <CardContent
          className={`grid gap-2 ${isSocial ? "ml-12 pl-0 pr-2" : "p-2"}`}
        >
          <p>{post.content}</p>

          {post.entityType === PostableEntityType.GROW && (
            <EmbeddedGrowCard grow={post.grow} />
          )}
          {post.entityType === PostableEntityType.PLANT && (
            <EmbeddedPlantCard plant={post.plant} />
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
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
