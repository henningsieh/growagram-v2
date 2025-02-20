"use client";

// src/components/features/Grows/grow-card.tsx:
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar1Icon,
  DotIcon,
  EditIcon,
  MessageSquareTextIcon,
  TentTree,
  Trash2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { modulePaths } from "~/assets/constants";
import AvatarCardHeader, {
  ActionItem,
} from "~/components/atom/avatar-card-header";
import { DeleteConfirmationDialog } from "~/components/atom/confirm-delete";
import { OwnerDropdownMenu } from "~/components/atom/owner-dropdown-menu";
// import { OwnerDropdownMenu } from "~/components/atom/owner-dropdown-menu"; // REMOVE
import { SocialCardFooter } from "~/components/atom/social-card-footer";
import { Comments } from "~/components/features/Comments/comments";
import { EmbeddedPlantCard } from "~/components/features/Plants/embedded-plant-card";
import PostFormModal from "~/components/features/Timeline/Post/post-form-modal";
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
import { Link, useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import { cn, formatDate, formatTime } from "~/lib/utils";
import type { GetAllGrowType, GetOwnGrowType } from "~/server/api/root";
import { CommentableEntityType } from "~/types/comment";
import { LikeableEntityType } from "~/types/like";
import { Locale } from "~/types/locale";
import { PostableEntityType } from "~/types/post";
import { UserRoles } from "~/types/user";

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

  const router = useRouter();
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

  const growActions: ActionItem[] = [];

  // Edit Action (visible to owner only)
  if (user && user.id === grow.ownerId) {
    growActions.push({
      icon: EditIcon,
      label: t("edit-button-label"),
      variant: "ghost",
      onClick: () => {
        router.push(`${modulePaths.GROWS.path}/${grow.id}/form`);
      },
    });
  }

  // Delete Action (visible to owner and admin)
  if (user && (user.id === grow.ownerId || user.role === UserRoles.ADMIN)) {
    growActions.push({
      icon: Trash2,
      label: t("delete-button-label"),
      variant: "destructive",
      onClick: handleDelete,
      disabled: deleteMutation.isPending,
    });
  }

  const dateElement = (
    <Link
      href={`/public/grows/${grow.id}`}
      title={t("grow-card-updatedAt")}
      className="flex items-center gap-1 whitespace-nowrap text-sm text-muted-foreground"
    >
      {<DotIcon size={24} className="-mx-2 hidden xs:block" />}
      {formatDate(grow.updatedAt, locale as Locale)}{" "}
      {formatTime(grow.updatedAt, locale as Locale)}
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
        entity={grow}
        entityType={PostableEntityType.GROW}
      />
      <Card
        className={cn(
          `flex flex-col overflow-hidden border border-secondary/20 pt-1`,
          isSocial && "bg-secondary/5",
        )}
      >
        {isSocial && (
          <AvatarCardHeader
            user={grow.owner}
            dateElement={dateElement}
            actions={growActions}
            showActions={growActions.length > 0}
          />
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
          <div className="flex min-w-0 items-center justify-between gap-2">
            <CardTitle as="h3" className="min-w-0">
              <Button
                asChild
                variant="link"
                className="flex min-w-0 items-center justify-start gap-2 p-1"
              >
                <Link href={`/public/grows/${grow.id}`}>
                  <TentTree className="flex-shrink-0" size={20} />
                  <span className="truncate font-semibold leading-normal">
                    {grow.name}
                  </span>
                </Link>
              </Button>
            </CardTitle>
            {/* DropdownMenu for grow's owner */}
            {!isSocial && user && user.id === grow.ownerId && (
              <OwnerDropdownMenu // REMOVE
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
          <CardDescription className="flex flex-col gap-1 px-1 font-mono text-xs tracking-tighter">
            <div
              title={
                t("grow-card-createdAt")
                // eslint-disable-next-line react/jsx-no-literals
              }
              className="flex items-center gap-2"
            >
              <Calendar1Icon size={18} />
              <span className="block">
                {formatDate(grow.createdAt, locale as Locale)}{" "}
                {formatTime(grow.createdAt, locale as Locale)}
              </span>
            </div>

            <div
              title={
                t("grow-card-updatedAt")
                // eslint-disable-next-line react/jsx-no-literals
              }
              className="flex items-center gap-2"
            >
              <EditIcon size={18} />
              <span className="block">
                {formatDate(grow.updatedAt, locale as Locale)}{" "}
                {formatTime(grow.updatedAt, locale as Locale)}
              </span>
            </div>
          </CardDescription>
          <div className="justify-top flex h-full flex-1 flex-col">
            {/* Plants Grid */}
            <div
              className={cn(
                "custom-scrollbar max-h-72 flex-1 space-y-2 overflow-y-auto",
                grow.plants.length > 2 && "pr-3",
              )}
            >
              <AnimatePresence>
                {grow.plants.map((plant) => (
                  <motion.div
                    key={plant.id}
                    initial={{ opacity: 0, y: -30 }}
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
                  {t("no-plants-connectable")}
                </div>
              )}
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
