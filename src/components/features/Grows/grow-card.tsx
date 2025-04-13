"use client";

// src/components/features/Grows/grow-card.tsx:
import * as React from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircleIcon,
  DotIcon,
  EditIcon,
  MessageSquareTextIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { modulePaths } from "~/assets/constants";
import landscapePlaceholder from "~/assets/landscape-placeholdersvg.svg";
import { RESPONSIVE_IMAGE_SIZES } from "~/components/Layouts/responsive-grid";
import AvatarCardHeader, {
  ActionItem,
} from "~/components/atom/avatar-card-header";
import { DeleteConfirmationDialog } from "~/components/atom/confirm-delete";
import { EntityDateInfo } from "~/components/atom/entity-date-info";
import { OwnerDropdownMenu } from "~/components/atom/owner-dropdown-menu";
import { SocialCardFooter } from "~/components/atom/social-card-footer";
import { Comments } from "~/components/features/Comments/comments";
import { EnhancedPlantCard } from "~/components/features/Plants/enhanced-plant-card.tsx";
import { PostFormModal } from "~/components/features/Timeline/Post/post-form-modal";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { useComments } from "~/hooks/use-comments";
import { useLikeStatus } from "~/hooks/use-likes";
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

  const tCommon = useTranslations("Platform");
  const t = useTranslations("Grows");

  const [isSocial, setIsSocial] = React.useState(isSocialProp);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = React.useState(false);

  const {
    isLiked,
    likeCount,
    isLoading: isLikeLoading,
  } = useLikeStatus(grow.id, LikeableEntityType.Grow);

  const { commentCount, commentCountLoading, isCommentsOpen, toggleComments } =
    useComments(grow.id, CommentableEntityType.Grow);

  const deleteMutation = api.grows.deleteById.useMutation({
    onSuccess: async () => {
      toast(t("DeleteConfirmation.success-title"), {
        description: t("DeleteConfirmation.success-description"),
      });
      await utils.grows.getOwnGrows.invalidate();
    },
    onError: (error) => {
      toast.error(t("error-title"), {
        description: `${t("error-default")} ${error.message || ""}`,
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

  if (user && (user.id === grow.ownerId || user.role === UserRoles.ADMIN)) {
    growActions.push({
      icon: Trash2Icon,
      label: t("delete-button-label"),
      variant: "destructive",
      onClick: handleDelete,
      disabled: deleteMutation.isPending,
    });
  }

  const dateElement = (
    <Link
      href={`/public/grows/${grow.id}`}
      title={tCommon("updated-at")}
      className="text-muted-foreground flex items-center gap-1 text-sm whitespace-nowrap underline-offset-3 hover:underline"
    >
      {<DotIcon size={24} className="xs:block -mx-2 hidden" />}
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
          `border-secondary/60 flex flex-col gap-0 overflow-hidden rounded-md border py-0 shadow-none`,
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
          className={`flex h-full flex-col gap-1 ${isSocial ? "ml-12 pr-2 pl-0" : "p-2"}`}
        >
          <div className="flex min-w-0 items-center justify-between gap-2">
            {/* Title Link */}
            <CardTitle as="h3" className="min-w-0">
              <Button
                asChild
                variant="link"
                className="text-secondary decoration-secondary flex min-w-0 items-center justify-start gap-2 px-0"
              >
                <Link href={`${modulePaths.PUBLICGROWS.path}/${grow.id}`}>
                  <span className="truncate text-2xl leading-normal font-semibold">
                    {grow.name}
                  </span>
                </Link>
              </Button>
            </CardTitle>
            {!isSocial && user && user.id === grow.ownerId && (
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
          {/* Header Image */}
          <div className="relative aspect-video w-full overflow-hidden rounded-md">
            {grow.headerImage ? (
              <Image
                fill
                sizes={RESPONSIVE_IMAGE_SIZES}
                src={grow.headerImage.imageUrl}
                alt={grow.name}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
              />
            ) : (
              <div className="bg-muted/10 relative h-full w-full">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    fill
                    sizes={RESPONSIVE_IMAGE_SIZES}
                    src={landscapePlaceholder as string}
                    alt={grow.name || "Grow placeholder"}
                    className="h-full w-full object-cover opacity-40 transition-opacity duration-300 hover:opacity-50"
                    priority
                  />
                </div>
              </div>
            )}
          </div>

          <EntityDateInfo
            createdAt={grow.createdAt}
            updatedAt={grow.updatedAt}
          />

          <div className="justify-top flex h-full flex-1 flex-col">
            <div
              className={cn(
                "custom-scrollbar max-h-72 flex-1 space-y-2 overflow-y-auto",
                grow.plants.length > 2 && "pr-3",
              )}
            >
              <AnimatePresence>
                {grow.plants.length ? (
                  grow.plants.map((plant) => (
                    <motion.div
                      key={plant.id}
                      initial={{ opacity: 0, y: -30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <EnhancedPlantCard plant={plant} />
                    </motion.div>
                  ))
                ) : (
                  <Alert variant="destructive" className="bg-accent/20">
                    <AlertCircleIcon className="h-4 w-4" />
                    <AlertTitle>{t("no-plants-connected")}</AlertTitle>
                    <AlertDescription>
                      <Button
                        variant="link"
                        className="text-primary p-0 font-semibold"
                        asChild
                      >
                        <Link
                          href={`${modulePaths.GROWS.path}/${grow.id}/form`}
                        >
                          {t("button-label-connect-plants")}
                        </Link>
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </AnimatePresence>
            </div>

            {!isSocial && (
              <Button
                size={"sm"}
                variant="primary"
                className="group flex transform items-center gap-2 rounded-sm p-2 font-semibold transition-all hover:translate-y-[-1px] hover:shadow-md"
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
            )}
          </div>
        </CardContent>

        {isSocial && (
          <SocialCardFooter
            className={`${isSocial && "ml-12"}`}
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
