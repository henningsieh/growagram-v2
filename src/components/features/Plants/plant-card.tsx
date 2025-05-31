"use client";

// src/components/features/plant/plant-card.tsx:
import * as React from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import {
  DotIcon,
  EditIcon,
  MessageSquareTextIcon,
  TentTreeIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { modulePaths } from "~/assets/constants";
import AvatarCardHeader, {
  ActionItem,
} from "~/components/atom/avatar-card-header";
import { DeleteConfirmationDialog } from "~/components/atom/confirm-delete";
import { EntityDateInfo } from "~/components/atom/entity-date-info";
import { TouchProvider } from "~/components/atom/hybrid-tooltip";
import { OwnerDropdownMenu } from "~/components/atom/owner-dropdown-menu";
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
  CardTitle,
} from "~/components/ui/card";
import { useComments } from "~/hooks/use-comments";
import { useLikeStatus } from "~/hooks/use-likes";
import { Link, useRouter } from "~/lib/i18n/routing";
import { useTRPC } from "~/lib/trpc/client";
import { cn, formatDateTime } from "~/lib/utils";
import type { PlantByIdType } from "~/server/api/root";
import { CommentableEntityType } from "~/types/comment";
import { LikeableEntityType } from "~/types/like";
import { Locale } from "~/types/locale";
import { PostableEntityType } from "~/types/post";
import { UserRoles } from "~/types/user";

interface PlantCardProps {
  plant: PlantByIdType;
  isSocialProp?: boolean;
}

export default function PlantCard({
  plant,
  isSocialProp = true,
}: PlantCardProps) {
  const trpc = useTRPC();
  const { data: session } = useSession();
  const user = session?.user;

  const router = useRouter();
  const locale = useLocale();
  const queryClient = useQueryClient();

  const tCommon = useTranslations("Platform");
  const t = useTranslations("Plants");

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

  // Initialize delete mutation
  const deleteMutation = useMutation(
    trpc.plants.deleteById.mutationOptions({
      onSuccess: async () => {
        toast("Success", {
          description: t("plant-deleted-successfully"),
        });
        // Invalidate and prefetch the plants query to refresh the list
        await queryClient.invalidateQueries(
          trpc.plants.getOwnPlants.pathFilter(),
        );
        // await utils.plants.getOwnPlants.prefetch();
        // router.refresh();
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

  const growActions: ActionItem[] = [];

  // Edit Action (visible to owner only)
  if (user && user.id === plant.ownerId) {
    growActions.push({
      icon: EditIcon,
      label: t("edit-button-label"),
      variant: "ghost",
      onClick: () => {
        router.push(`${modulePaths.PLANTS.path}/${plant.id}/form`);
      },
    });
  }

  // Delete Action (visible to owner and admin)
  if (user && (user.id === plant.ownerId || user.role === UserRoles.ADMIN)) {
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
      href={`${modulePaths.PUBLICPLANTS.path}/${plant.id}`}
      title={tCommon("updated-at")}
      className="text-muted-foreground flex items-center gap-1 text-sm whitespace-nowrap underline-offset-3 hover:underline"
    >
      {<DotIcon size={24} className="hidden sm:block" />}
      {formatDateTime(plant.updatedAt, locale as Locale)}
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
            `border-primary/60 flex flex-col gap-0 overflow-hidden rounded-md border py-0 shadow-none`,
            // isSocial && "bg-primary/5",
          )}
        >
          {isSocial && (
            <AvatarCardHeader
              user={plant.owner}
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

              {/* DropdownMenu for plant's owner */}
              {user && user.id === plant.ownerId && (
                <OwnerDropdownMenu
                  isSocial={isSocial}
                  setIsSocial={setIsSocial}
                  isDeleting={deleteMutation.isPending}
                  handleDelete={handleDelete}
                  entityId={plant.id}
                  entityType="Plants"
                />
              )}
            </div>

            {/* Image Carousel */}
            <ImageCarousel plantImages={plant.plantImages} />

            {/* Date Information */}
            <EntityDateInfo
              createdAt={plant.createdAt}
              updatedAt={plant.updatedAt}
            />

            {/* Plant Progress and Dates */}
            <PlantProgressAndDates plant={plant} />

            <CardDescription>
              <div className="flex min-h-6 items-center justify-between gap-2 p-0">
                {/* Strain Tooltip */}
                <div>
                  {plant.strain && <StrainBadge strain={plant.strain} />}
                </div>
                {/* Grow Badge-Link */}
                {plant.grow && (
                  <div className="flex flex-wrap gap-2 p-0">
                    <Link
                      href={`${modulePaths.PUBLICGROWS.path}/${plant.grow.id}`}
                    >
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
          </CardContent>
          {
            isSocial && (
              <SocialCardFooter
                className={`${isSocial && "ml-12"}`}
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
            )

            // : (
            //   user &&
            //   user.id === plant.ownerId && (
            //     // Owner Buttons
            //     <>
            //       <Separator />
            //       <CardFooter className="flex w-full justify-between gap-1 p-1">
            //         <Button
            //           variant="destructive"
            //           size="sm"
            //           className="w-20"
            //           onClick={handleDelete}
            //           disabled={deleteMutation.isPending}
            //         >
            //           {deleteMutation.isPending ? (
            //             <Loader2 size={20} className="animate-spin" />
            //           ) : (
            //             <Trash2 size={20} />
            //           )}
            //         </Button>
            //         <Button asChild size="sm" className="w-full text-base">
            //           <Link href={`/plants/${plant.id}/form`}>
            //             <Edit size={20} />
            //             {t("edit-plant-button-label")}
            //           </Link>
            //         </Button>
            //       </CardFooter>
            //     </>
            //   )
            // )
          }
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
