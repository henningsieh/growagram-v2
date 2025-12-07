"use client";

// src/components/features/Grows/grow-card.tsx:
import * as React from "react";

import Image from "next/image";

import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";

import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import {
  DotIcon,
  Edit3Icon,
  MessageSquareTextIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import { RESPONSIVE_IMAGE_SIZES } from "~/components/Layouts/responsive-grid";
import { ActionItem, ActionsMenu } from "~/components/atom/actions-menu";
import AvatarCardHeader from "~/components/atom/avatar-card-header";
import { DeleteConfirmationDialog } from "~/components/atom/confirm-delete";
import { EntityDateInfo } from "~/components/atom/entity-date-info";
import { SocialCardFooter } from "~/components/atom/social-card-footer";
import { Comments } from "~/components/features/Comments/comments";
import { PostFormModal } from "~/components/features/Timeline/Post/post-form-modal";

import type { GetAllGrowType, GetOwnGrowType } from "~/server/api/root";

import { CommentableEntityType } from "~/types/comment";
import {
  CultureMedium,
  FertilizerForm,
  FertilizerType,
  GrowEnvironment,
} from "~/types/grow";
import { LikeableEntityType } from "~/types/like";
import { Locale } from "~/types/locale";
import { PostableEntityType } from "~/types/post";
import { UserRoles } from "~/types/user";

import { Link, useRouter } from "~/lib/i18n/routing";
import { useTRPC } from "~/lib/trpc/client";
import {
  cn,
  formatDateTime,
  getCultureMediumEmoji,
  getCultureMediumTranslationKey,
  getFertilizerFormEmoji,
  getFertilizerFormTranslationKey,
  getFertilizerTypeEmoji,
  getFertilizerTypeTranslationKey,
  getGrowEnvironmentEmoji,
  getGrowEnvironmentTranslationKey,
} from "~/lib/utils";

import { useComments } from "~/hooks/use-comments";
import { useLikeStatus } from "~/hooks/use-likes";

import { APP_SETTINGS, modulePaths } from "~/assets/constants";

interface GrowCardProps {
  grow: GetOwnGrowType | GetAllGrowType;
  isSocial?: boolean;
}

export function GrowCard({
  grow,
  isSocial: isSocialProp = true,
}: GrowCardProps) {
  const trpc = useTRPC();
  const { data: session } = useSession();
  const user = session?.user;

  const router = useRouter();
  const locale = useLocale();
  const queryClient = useQueryClient();

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

  const deleteMutation = useMutation(
    trpc.grows.deleteById.mutationOptions({
      onSuccess: async () => {
        toast(t("DeleteConfirmation.success-title"), {
          description: t("DeleteConfirmation.success-description"),
        });
        await queryClient.invalidateQueries(
          trpc.grows.getOwnGrows.pathFilter(),
        );
      },
      onError: (error) => {
        toast.error(t("error-title"), {
          description: `${t("error-default")} ${error.message || ""}`,
        });
      },
    }),
  );

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    await deleteMutation.mutateAsync({ id: grow.id });
    setIsDeleteDialogOpen(false);
  };

  // Build actions array for both social and non-social modes
  const growActions: ActionItem[] = [];

  // Owner actions: Edit (only for grow owners)
  if (user && user.id === grow.ownerId) {
    growActions.push({
      icon: Edit3Icon,
      label: t("edit-button-label"),
      variant: "ghost",
      onClick: () => {
        router.push(`${modulePaths.GROWS.path}/${grow.id}/form`);
      },
    });
  }

  // Admin/Owner actions: Delete (for grow owners OR admins)
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
      href={`${modulePaths.PUBLICGROWS.path}/${grow.id}`}
      title={tCommon("updated-at")}
      className="text-muted-foreground flex items-center gap-1 text-sm whitespace-nowrap underline-offset-3 hover:underline"
    >
      {<DotIcon size={24} className="xs:block -mx-2 hidden" />}
      {formatDateTime(grow.updatedAt, locale as Locale)}
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
          <div className="flex min-w-0 justify-between gap-2">
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
            {!isSocial && growActions.length > 0 && (
              <ActionsMenu actions={growActions} />
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
                    src={APP_SETTINGS.PLACEHOLDER_IMAGE_PATH}
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

          {/* Exploration Info */}
          <TooltipProvider>
            <div className="grid grid-cols-2 gap-2">
              {/* Environment */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    <span className="text-sm">
                      {grow.environment
                        ? getGrowEnvironmentEmoji(grow.environment)
                        : getGrowEnvironmentEmoji(GrowEnvironment.INDOOR)}
                    </span>
                    <span className="truncate">
                      {grow.environment
                        ? t(getGrowEnvironmentTranslationKey(grow.environment))
                        : t("not-specified")}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {t("environment-label")}
                    {": "}
                    {grow.environment
                      ? t(getGrowEnvironmentTranslationKey(grow.environment))
                      : t("not-specified")}
                  </p>
                </TooltipContent>
              </Tooltip>

              {/* Culture Medium */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    <span className="text-sm">
                      {grow.cultureMedium
                        ? getCultureMediumEmoji(grow.cultureMedium)
                        : getCultureMediumEmoji(CultureMedium.SOIL)}
                    </span>
                    <span className="truncate">
                      {grow.cultureMedium
                        ? t(getCultureMediumTranslationKey(grow.cultureMedium))
                        : t("not-specified")}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {t("culture-medium-label")}
                    {": "}
                    {grow.cultureMedium
                      ? t(getCultureMediumTranslationKey(grow.cultureMedium))
                      : t("not-specified")}
                  </p>
                </TooltipContent>
              </Tooltip>

              {/* Fertilizer Type */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    <span className="text-sm">
                      {grow.fertilizerType
                        ? getFertilizerTypeEmoji(grow.fertilizerType)
                        : getFertilizerTypeEmoji(FertilizerType.ORGANIC)}
                    </span>
                    <span className="truncate">
                      {grow.fertilizerType
                        ? t(
                            getFertilizerTypeTranslationKey(
                              grow.fertilizerType,
                            ),
                          )
                        : t("not-specified")}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {t("fertilizer-type-label")}
                    {": "}
                    {grow.fertilizerType
                      ? t(getFertilizerTypeTranslationKey(grow.fertilizerType))
                      : t("not-specified")}
                  </p>
                </TooltipContent>
              </Tooltip>

              {/* Fertilizer Form */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    <span className="text-sm">
                      {grow.fertilizerForm
                        ? getFertilizerFormEmoji(grow.fertilizerForm)
                        : getFertilizerFormEmoji(FertilizerForm.LIQUID)}
                    </span>
                    <span className="truncate">
                      {grow.fertilizerForm
                        ? t(
                            getFertilizerFormTranslationKey(
                              grow.fertilizerForm,
                            ),
                          )
                        : t("not-specified")}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {t("fertilizer-form-label")}
                    {": "}
                    {grow.fertilizerForm
                      ? t(getFertilizerFormTranslationKey(grow.fertilizerForm))
                      : t("not-specified")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          <div className="justify-top flex h-full flex-1 flex-col">
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
