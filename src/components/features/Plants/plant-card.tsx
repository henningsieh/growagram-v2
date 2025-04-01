"use client";

// src/components/features/plant/plant-card.tsx:
import * as React from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import {
  DnaIcon,
  DotIcon,
  EditIcon,
  FlowerIcon,
  LeafIcon,
  MessageSquareTextIcon,
  NutIcon,
  PillBottleIcon,
  SproutIcon,
  TagIcon,
  TentTreeIcon,
  Trash2Icon,
  WheatIcon,
} from "lucide-react";
import { toast } from "sonner";
import { modulePaths } from "~/assets/constants";
import AvatarCardHeader, {
  ActionItem,
} from "~/components/atom/avatar-card-header";
import { DeleteConfirmationDialog } from "~/components/atom/confirm-delete";
import {
  HybridTooltip,
  HybridTooltipContent,
  HybridTooltipTrigger,
  TouchProvider,
} from "~/components/atom/hybrid-tooltip";
import { OwnerDropdownMenu } from "~/components/atom/owner-dropdown-menu";
import { SocialCardFooter } from "~/components/atom/social-card-footer";
import { Comments } from "~/components/features/Comments/comments";
import { ImageCarousel } from "~/components/features/Plants/image-carousel";
import { PostFormModal } from "~/components/features/Timeline/Post/post-form-modal";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { useComments } from "~/hooks/use-comments";
import { useLikeStatus } from "~/hooks/use-likes";
import { Link, useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import { cn, formatDate, formatTime } from "~/lib/utils";
import { calculateGrowthProgress } from "~/lib/utils/calculateGrowthProgress";
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
  const { data: session } = useSession();
  const user = session?.user;

  const router = useRouter();
  const locale = useLocale();
  const utils = api.useUtils();

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
  const deleteMutation = api.plants.deleteById.useMutation({
    onSuccess: async () => {
      toast("Success", {
        description: t("plant-deleted-successfully"),
      });
      // Invalidate and prefetch the plants query to refresh the list
      await utils.plants.getOwnPlants.invalidate();
      // await utils.plants.getOwnPlants.prefetch();
      // router.refresh();
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || t("error-default"),
      });
    },
  });

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    await deleteMutation.mutateAsync({ id: plant.id });
    setIsDeleteDialogOpen(false);
  };

  const progress = calculateGrowthProgress(plant);

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
      href={`/public/plants/${plant.id}`}
      title={t("plant-card-createdAt")}
      className="text-muted-foreground flex items-center gap-1 text-sm whitespace-nowrap"
    >
      {<DotIcon size={24} className="xs:block -mx-2 hidden" />}
      {formatDate(plant.createdAt, locale as Locale)}{" "}
      {formatTime(plant.createdAt, locale as Locale)}
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
            `border-primary/20 flex flex-col overflow-hidden border py-0`,
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
            className={`grid gap-2 ${isSocial ? "ml-12 pr-2 pl-0" : "p-2"}`}
          >
            {/* Image Carousel */}
            <ImageCarousel plantImages={plant.plantImages} />
            {/* Title Link */}
            <div className="flex min-w-0 items-center justify-between gap-2">
              <CardTitle as="h3" className="min-w-0">
                <Button
                  asChild
                  variant="link"
                  className="flex min-w-0 items-center justify-start gap-2 p-1"
                >
                  <Link href={`/public/plants/${plant.id}`}>
                    <TagIcon className="shrink-0" size={20} />
                    <span className="truncate leading-normal font-semibold">
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
            {/* Strain Info */}
            <CardDescription>
              <div className="flex min-h-6 items-center justify-between gap-2 p-0">
                <HybridTooltip>
                  <HybridTooltipTrigger
                    className={`flex cursor-help items-center gap-2`}
                  >
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 border-[1px] border-fuchsia-700"
                    >
                      <DnaIcon
                        className={`h-4 w-4`}
                        // eslint-disable-next-line react/jsx-no-literals
                      />
                      Strain
                    </Badge>
                  </HybridTooltipTrigger>
                  <HybridTooltipContent className={`w-auto bg-fuchsia-600 p-1`}>
                    <div>
                      <span className="block">
                        {
                          t("strain")
                          // eslint-disable-next-line react/jsx-no-literals
                        }
                        : {plant.strain?.name ?? "Unknown"}
                      </span>
                      <span className="block">
                        {
                          t("breeder")
                          // eslint-disable-next-line react/jsx-no-literals
                        }
                        : {plant.strain?.breeder.name ?? "Unknown"}
                      </span>
                    </div>
                  </HybridTooltipContent>
                </HybridTooltip>
                {/* Grow Badge */}
                {plant.grow && (
                  <div className="flex flex-wrap gap-2 p-0">
                    <Link href={`/public/grows/${plant.grow.id}`}>
                      <Badge
                        variant="grow"
                        className="flex max-w-32 items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap"
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
            <Card className="bg-muted/30 space-y-4 rounded-md p-2 sm:p-4 md:p-6">
              <CardHeader className="flex w-full flex-col p-0">
                <div className="mb-1 flex justify-between text-sm">
                  <span>{t("overall-progress")}</span>
                  <span>
                    {
                      progress.overallProgress
                      // eslint-disable-next-line react/jsx-no-literals
                    }
                    %
                  </span>
                </div>
                <Progress value={progress.overallProgress} className="w-full" />
              </CardHeader>
              <CardContent className="space-y-2 p-0">
                <div className="flex h-4 items-center">
                  <HybridTooltip>
                    <HybridTooltipTrigger className="flex cursor-default items-center font-mono text-sm font-semibold tracking-tighter">
                      <NutIcon className={`text-planted mr-2 h-4 w-4`} />
                      {formatDate(plant.startDate, locale as Locale, {
                        force: true,
                      })}
                    </HybridTooltipTrigger>
                    <HybridTooltipContent
                      side="right"
                      className="w-auto border-0 bg-transparent p-2"
                    >
                      <Badge
                        variant={"outline"}
                        className="bg-planted border-0 text-sm whitespace-nowrap text-white"
                      >
                        {t("planting-date")}
                      </Badge>
                    </HybridTooltipContent>
                  </HybridTooltip>
                </div>
                <div className="flex h-4 items-center">
                  <HybridTooltip>
                    <HybridTooltipTrigger className="flex cursor-default items-center font-mono text-sm font-semibold tracking-tighter">
                      <SproutIcon
                        className={`mr-2 h-4 w-4 ${
                          plant.seedlingPhaseStart
                            ? "text-seedling"
                            : "text-seedling/40"
                        }`}
                      />
                      {plant.seedlingPhaseStart &&
                        formatDate(plant.seedlingPhaseStart, locale as Locale, {
                          force: true,
                        })}
                    </HybridTooltipTrigger>
                    <HybridTooltipContent
                      side="right"
                      className="w-auto border-0 bg-transparent p-2"
                    >
                      <Badge
                        variant={"outline"}
                        className="bg-seedling border-0 text-sm whitespace-nowrap text-white"
                      >
                        {t("germination-date")}
                      </Badge>
                    </HybridTooltipContent>
                  </HybridTooltip>
                </div>
                <div className="flex h-4 items-center">
                  <HybridTooltip>
                    <HybridTooltipTrigger className="flex cursor-default items-center font-mono text-sm font-semibold tracking-tighter">
                      <LeafIcon
                        className={`mr-2 h-4 w-4 ${
                          plant.vegetationPhaseStart
                            ? "text-vegetation"
                            : "text-vegetation/40"
                        }`}
                      />
                      {plant.vegetationPhaseStart &&
                        formatDate(
                          plant.vegetationPhaseStart,
                          locale as Locale,
                          { force: true },
                        )}
                    </HybridTooltipTrigger>
                    <HybridTooltipContent
                      side="right"
                      className="w-auto border-0 bg-transparent p-2"
                    >
                      <Badge
                        variant={"outline"}
                        className="bg-vegetation border-0 text-sm whitespace-nowrap text-white"
                      >
                        {t("vegetation-start-date")}
                      </Badge>
                    </HybridTooltipContent>
                  </HybridTooltip>
                </div>
                <div className="flex h-4 items-center">
                  <HybridTooltip>
                    <HybridTooltipTrigger className="flex cursor-default items-center font-mono text-sm font-semibold tracking-tighter">
                      <FlowerIcon
                        className={`mr-2 h-4 w-4 ${
                          plant.floweringPhaseStart
                            ? "text-flowering"
                            : "text-flowering/40"
                        }`}
                      />
                      {plant.floweringPhaseStart &&
                        formatDate(
                          plant.floweringPhaseStart,
                          locale as Locale,
                          { force: true },
                        )}
                    </HybridTooltipTrigger>
                    <HybridTooltipContent
                      side="right"
                      className="w-auto border-0 bg-transparent p-2"
                    >
                      <Badge
                        variant={"outline"}
                        className="bg-flowering border-0 text-sm whitespace-nowrap text-white"
                      >
                        {t("flowering-start-date")}
                      </Badge>
                    </HybridTooltipContent>
                  </HybridTooltip>
                </div>
                <div className="flex h-4 items-center">
                  <HybridTooltip>
                    <HybridTooltipTrigger className="flex cursor-default items-center font-mono text-sm font-semibold tracking-tighter">
                      <WheatIcon
                        className={`mr-2 h-4 w-4 ${
                          plant.harvestDate ? "text-harvest" : "text-harvest/40"
                        }`}
                      />
                      {plant.harvestDate &&
                        formatDate(plant.harvestDate, locale as Locale, {
                          force: true,
                        })}
                    </HybridTooltipTrigger>
                    <HybridTooltipContent
                      side="right"
                      className="w-auto border-0 bg-transparent p-2"
                    >
                      <Badge
                        variant={"outline"}
                        className="bg-harvest text-sm whitespace-nowrap text-white"
                      >
                        {t("harvest-date")}
                      </Badge>
                    </HybridTooltipContent>
                  </HybridTooltip>
                </div>
                <div className="flex h-4 items-center">
                  <HybridTooltip>
                    <HybridTooltipTrigger className="flex cursor-default items-center font-mono text-sm font-semibold tracking-tighter">
                      <PillBottleIcon
                        className={`mr-2 h-4 w-4 ${
                          plant.curingPhaseStart
                            ? "text-curing"
                            : "text-curing/40"
                        }`}
                      />
                      {plant.curingPhaseStart &&
                        formatDate(plant.curingPhaseStart, locale as Locale, {
                          force: true,
                        })}
                    </HybridTooltipTrigger>
                    <HybridTooltipContent
                      side="right"
                      className="w-auto border-0 bg-transparent p-2"
                    >
                      <Badge
                        variant={"outline"}
                        className="bg-curing text-sm whitespace-nowrap text-white"
                      >
                        {t("curing-start-date")}
                      </Badge>
                    </HybridTooltipContent>
                  </HybridTooltip>
                </div>
              </CardContent>
            </Card>
            {!isSocial && (
              <Button
                size={"sm"}
                className="p-2 font-semibold"
                onClick={() => setIsPostModalOpen(true)}
              >
                <MessageSquareTextIcon size={20} />
                {t("button-label-post-update")}
              </Button>
            )}
          </CardContent>
          {
            isSocial && (
              <SocialCardFooter
                className={`pr-2 pb-2 ${isSocial && "ml-12"}`}
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
