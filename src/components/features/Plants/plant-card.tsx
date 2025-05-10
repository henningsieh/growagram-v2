"use client";

// src/components/features/plant/plant-card.tsx:
import * as React from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  EditIcon,
  ExternalLinkIcon,
  MessageSquareTextIcon,
  TentTreeIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { modulePaths } from "~/assets/constants";
import { ActionItem } from "~/components/atom/actions-menu";
import { ActionsMenu } from "~/components/atom/actions-menu";
import AvatarCardHeader from "~/components/atom/avatar-card-header";
import { DeleteConfirmationDialog } from "~/components/atom/confirm-delete";
import { EntityDateInfo } from "~/components/atom/entity-date-info";
import { TouchProvider } from "~/components/atom/hybrid-tooltip";
import { SocialCardFooter } from "~/components/atom/social-card-footer";
import StrainBadge from "~/components/atom/strain-badge";
import { Comments } from "~/components/features/Comments/comments";
import { ImageCarousel } from "~/components/features/Plants/image-carousel";
import { PlantProgressAndDates } from "~/components/features/Plants/plant-progress-and-dates";
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
import { useComments } from "~/hooks/use-comments";
import { useLikeStatus } from "~/hooks/use-likes";
import { Link, useRouter } from "~/lib/i18n/routing";
import { cn, formatDate, formatTime } from "~/lib/utils";
import type { PlantByIdType } from "~/server/api/root";
import { useTRPC } from "~/trpc/client";
import { CommentableEntityType } from "~/types/comment";
import { LikeableEntityType } from "~/types/like";
import { Locale } from "~/types/locale";
import { PostableEntityType } from "~/types/post";
import { UserRoles } from "~/types/user";

interface PlantCardProps {
  plant: PlantByIdType;
  isSocialProp?: boolean;
}

export function PlantCard({ plant, isSocialProp = true }: PlantCardProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const locale = useLocale();

  const tCommon = useTranslations("Platform");
  const t = useTranslations("Plants");

  const { data: session } = useSession();
  const user = session?.user;

  const searchParams = useSearchParams();
  const currentParams = React.useMemo(() => {
    return new URLSearchParams(searchParams.toString());
  }, [searchParams]);

  const [isSocial, setIsSocial] = React.useState(isSocialProp);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = React.useState(false);

  const {
    isLiked,
    likeCount,
    isLoading: isLikeLoading,
  } = useLikeStatus(plant.id, LikeableEntityType.Plant);

  const { commentCount, commentCountLoading, isCommentsOpen, toggleComments } =
    useComments(plant.id, CommentableEntityType.Plant);

  // Initialize delete mutation using Tanstack Query
  const deleteMutation = useMutation(
    trpc.plants.deleteById.mutationOptions({
      onSuccess: async () => {
        toast(t("DeleteConfirmation.success-title"), {
          description: t("plant-deleted-successfully"),
        });
        // Invalidate and refresh the plants query using TanStack's approach
        await queryClient.invalidateQueries({
          queryKey: [["plants", "getOwnPlants"]],
        });
      },
      onError: (error) => {
        toast.error("Error", {
          description: error.message || t("error-default"),
        });
      },
    }),
  );

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    await deleteMutation.mutateAsync({ id: plant.id });
    setIsDeleteDialogOpen(false);
  };

  // Memoized actions array
  const actions = React.useMemo((): ActionItem[] => {
    if (!user) return [];

    const actions: ActionItem[] = [];

    // Public Link - Always show for owner
    if (user.id === plant.ownerId) {
      actions.push({
        icon: ExternalLinkIcon,
        label: t(`public-link-label`),
        onClick: () => {
          window.open(`${modulePaths.PUBLICPLANTS.path}/${plant.id}`, "_blank");
        },
        variant: "ghost",
      });
    }

    // Edit Action - Only for owner
    if (user.id === plant.ownerId) {
      actions.push({
        icon: EditIcon,
        label: t("edit-button-label"),
        onClick: () => {
          // Construct the target URL with existing search parameters
          const targetPath = `${modulePaths.PLANTS.path}/${plant.id}/form`;
          router.push(`${targetPath}?${currentParams.toString()}`);
        },
        variant: "ghost",
      });
    }

    // Delete Action - For owner and admin
    if (user.id === plant.ownerId || user.role === UserRoles.ADMIN) {
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
    t,
    user,
    plant.id,
    plant.ownerId,
    router,
    currentParams,
    deleteMutation.isPending,
  ]);

  const dateElement = (
    <Link
      href={`${modulePaths.PUBLICPLANTS.path}/${plant.id}`}
      title={tCommon("updated-at")}
      className="text-muted-foreground flex items-center gap-1 text-sm whitespace-nowrap underline-offset-3 hover:underline"
    >
      {formatDate(plant.updatedAt, locale as Locale, { includeYear: false })}{" "}
      {formatTime(plant.updatedAt, locale as Locale)}
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
        entity={plant}
        entityType={PostableEntityType.PLANT}
      />
      <TouchProvider>
        <Card
          className={cn(
            "border-primary/60 flex h-full flex-col gap-0 overflow-hidden rounded-md border py-0 shadow-none",
          )}
        >
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
                user={plant.owner}
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
                    <Link href={`${modulePaths.PUBLICPLANTS.path}/${plant.id}`}>
                      <span className="truncate text-2xl leading-normal font-semibold">
                        {plant.name}
                      </span>
                    </Link>
                  </Button>
                </CardTitle>

                {/* ActionsMenu */}
                {user && user.id === plant.ownerId && actions.length > 0 && (
                  <ActionsMenu actions={actions} />
                )}
              </div>
            )}
          </CardHeader>

          {/* Card Content */}
          <CardContent
            className={cn(
              "flex flex-1 flex-col px-2",
              isSocial && "ml-12 pr-2 pl-0",
            )}
          >
            {/* Image Carousel */}
            <ImageCarousel plantImages={plant.plantImages} />

            <CardDescription className="my-2">
              <div className="flex items-center justify-between gap-2 p-0">
                {/* Strain Tooltip */}
                <div>
                  {plant.strain && <StrainBadge strain={plant.strain} />}
                </div>
                {/* Grow Badge-Link */}
                {plant.grow && (
                  <div className="flex flex-wrap gap-2 p-0">
                    <Link href={`/public/grows/${plant.grow.id}`}>
                      <Badge
                        variant="grow"
                        className="flex max-w-32 items-center gap-1 overflow-hidden rounded-sm text-ellipsis whitespace-nowrap"
                      >
                        <TentTreeIcon className="h-4 w-4 shrink-0" />
                        <span className="overflow-hidden text-ellipsis">
                          {plant.grow.name}
                        </span>
                      </Badge>
                    </Link>
                  </div>
                )}
              </div>
            </CardDescription>

            {/* Plant Progress and Dates */}
            <PlantProgressAndDates plant={plant} />

            {/* Date Information - Moved above footer content */}
            <EntityDateInfo
              createdAt={plant.createdAt}
              updatedAt={plant.updatedAt}
            />
          </CardContent>

          {/* Card Footer */}
          <CardFooter className={cn("p-2", isSocial && "ml-12")}>
            {!isSocial && (
              <Button
                size={"sm"}
                variant="primary"
                className="group flex w-full transform items-center justify-center gap-2 rounded-sm p-2 font-semibold transition-all hover:translate-y-[-1px] hover:shadow-md"
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

            {isSocial && (
              <SocialCardFooter
                entityId={plant.id}
                entityType={LikeableEntityType.Plant}
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
          </CardFooter>

          {isSocial && isCommentsOpen && (
            <Comments
              entityId={plant.id}
              entityType={CommentableEntityType.Plant}
              isSocial={isSocial}
            />
          )}
        </Card>
      </TouchProvider>
    </>
  );
}
