"use client";

// src/components/features/Grows/grow-card.tsx:
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquareTextIcon, TentTree } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import PostFormModal from "~/components/PostFormModal";
import AvatarCardHeader from "~/components/atom/avatar-card-header";
import { DeleteConfirmationDialog } from "~/components/atom/confirm-delete";
import { OwnerDropdownMenu } from "~/components/atom/owner-dropdown-menu";
import { SocialCardFooter } from "~/components/atom/social-card-footer";
import { Comments } from "~/components/features/Comments/comments";
import { EmbeddedPlantCard } from "~/components/features/Plants/embedded-plant-card";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
import { useComments } from "~/hooks/use-comments";
import { useLikeStatus } from "~/hooks/use-likes";
import { useToast } from "~/hooks/use-toast";
import { Link } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import {
  type DateFormatOptions,
  cn,
  formatDate,
  formatTime,
} from "~/lib/utils";
import type { GetAllGrowType, GetOwnGrowType } from "~/server/api/root";
import { CommentableEntityType } from "~/types/comment";
import { LikeableEntityType } from "~/types/like";
import { Locale } from "~/types/locale";
import { PostableEntityType } from "~/types/post";

interface GrowCardProps {
  grow: GetOwnGrowType | GetAllGrowType;
  isSocial?: boolean;
}

export function GrowCard({
  grow,
  isSocial: isSocialProp = true,
}: GrowCardProps) {
  const { data: session } = useSession();
  const user = session?.user;

  const locale = useLocale();
  const utils = api.useUtils();
  const { toast } = useToast();
  const t = useTranslations("Grows");

  const [isSocial, setIsSocial] = useState(isSocialProp);
  // const [isImageHovered, setIsImageHovered] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const {
    isLiked,
    likeCount,
    isLoading: isLikeLoading,
  } = useLikeStatus(grow.id, LikeableEntityType.Grow);

  const { commentCount, commentCountLoading, isCommentsOpen, toggleComments } =
    useComments(grow.id, CommentableEntityType.Grow);

  // Initialize delete mutation
  const deleteMutation = api.grows.deleteById.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Grow deleted successfully",
      });
      // Invalidate and prefetch the plants query to refresh the list
      await utils.grows.getOwnGrows.invalidate();
      // await utils.grows.getOwnGrows.prefetch();
      // router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete grow",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    await deleteMutation.mutateAsync({ id: grow.id });
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={confirmDelete}
        isDeleting={deleteMutation.isPending}
        title="Are you sure you want to remove this grow?"
        description="No plant will be deleted by this action!"
        alertCautionText="This action also deletes postings and other events if they only refer to this grow!"
      />
      <PostFormModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        entity={grow}
        entityType={PostableEntityType.GROW}
      />
      <Card
        className={cn(
          `flex flex-col overflow-hidden border border-secondary/70`,
          isSocial && "border-none",
        )}
      >
        {isSocial && (
          <AvatarCardHeader user={grow.owner} date={grow.createdAt} />
        )}

        <CardContent
          className={`flex h-full flex-col gap-2 ${isSocial ? "ml-12 pl-0 pr-2" : "p-2"}`}
        >
          {/* Grow HeaderImage */}
          {/* <div
            className="relative aspect-video overflow-hidden"
            onMouseEnter={() => setIsImageHovered(true)}
            onMouseLeave={() => setIsImageHovered(false)}
          >
            <Image
              src={headerImagePlaceholder || "/placeholder.svg"}
              alt={grow.name}
              fill
              className="object-cover transition-transform duration-300"
              sizes={RESPONSIVE_IMAGE_SIZES}
              style={{
                transform: isImageHovered ? "scale(1.05)" : "scale(1)",
              }}
            />
          </div> */}

          {/* Title Link */}
          <div className="flex min-w-0 items-center gap-2">
            <CardTitle as="h3" className="min-w-0 flex-1">
              <Button
                asChild
                variant="link"
                className="w-full justify-start p-1"
              >
                <Link
                  href={`/public/grows/${grow.id}`}
                  className="flex min-w-0 items-center gap-2"
                >
                  <TentTree className="flex-shrink-0" size={20} />
                  <span className="truncate font-semibold">{grow.name}</span>
                </Link>
              </Button>
            </CardTitle>
            {/* DropdownMenu for grow's owner */}
            {user && user.id === grow.ownerId && (
              <OwnerDropdownMenu
                isSocial={isSocial}
                setIsSocial={setIsSocial}
                isDeleting={deleteMutation.isPending}
                handleDelete={handleDelete}
                entityId={grow.id}
                entityType="Grows"
              />
            )}
          </div>

          {/* Grow created and updated at Date */}
          <CardDescription>
            <span className="block">
              {
                t("grow-card-createdAt")
                // eslint-disable-next-line react/jsx-no-literals
              }
              :{" "}
              {formatDate(
                grow.createdAt,
                locale as Locale,
                {
                  weekday: "short",
                  month: "long",
                } as DateFormatOptions,
              )}
            </span>
            {grow.updatedAt && (
              <div className="block">
                {
                  t("grow-card-updatedAt")
                  // eslint-disable-next-line react/jsx-no-literals
                }
                :{" "}
                {formatDate(
                  grow.updatedAt,
                  locale as Locale,
                  {
                    weekday: "short",
                    month: "long",
                  } as DateFormatOptions,
                )}{" "}
                {formatTime(grow.updatedAt, locale as Locale)}
              </div>
            )}
          </CardDescription>
          <div className="justify-top flex h-full flex-1 flex-col">
            {/* Plants Grid */}
            <div className="custom-scrollbar max-h-72 flex-1 overflow-y-auto pr-3">
              <div className="space-y-4">
                <AnimatePresence>
                  {grow.plants.map((plant) => (
                    <motion.div
                      key={plant.id}
                      initial={{ opacity: 0, y: -50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <EmbeddedPlantCard plant={plant} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {grow.plants.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    {t("no-plants-connected")}
                  </div>
                )}
              </div>
            </div>

            {/* Post Update Button */}
            {!isSocial && (
              <div className="mt-4">
                <Button
                  size={"sm"}
                  className="w-full p-2 font-semibold"
                  onClick={() => setIsPostModalOpen(true)}
                >
                  <MessageSquareTextIcon size={20} />
                  {t("button-label-post-update")}
                </Button>
              </div>
            )}
          </div>
        </CardContent>

        {isSocial && (
          <SocialCardFooter
            className={`pb-2 pr-2 ${isSocial && "ml-12"}`}
            entityId={grow.id}
            entityType={LikeableEntityType.Grow}
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
            entityId={grow.id}
            entityType={CommentableEntityType.Grow}
            isSocial={isSocial}
          />
        )}
      </Card>
    </>
  );
}
