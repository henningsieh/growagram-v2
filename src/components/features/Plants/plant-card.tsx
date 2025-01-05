"use client";

// src/components/features/plant/plant-card.tsx:
import { TooltipProvider } from "@radix-ui/react-tooltip";
import {
  EditIcon,
  ExternalLinkIcon,
  Flower2,
  Leaf,
  Loader2,
  MessageCircleIcon,
  MoreHorizontalIcon,
  Nut,
  PillBottle,
  Sprout,
  Tag,
  Trash2Icon,
  Wheat,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import AvatarCardHeader from "~/components/atom/avatar-card-header";
import { DeleteConfirmationDialog } from "~/components/atom/confirm-delete";
import { SocialCardFooter } from "~/components/atom/social-card-footer";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Label } from "~/components/ui/label";
import { Progress } from "~/components/ui/progress";
import { Switch } from "~/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useComments } from "~/hooks/use-comments";
import { useLikeStatus } from "~/hooks/use-likes";
import { useToast } from "~/hooks/use-toast";
import { Link } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import { formatDate } from "~/lib/utils";
import { calculateGrowthProgress } from "~/lib/utils/calculateDetailedGrowthProgress";
import { PlantByIdType } from "~/server/api/root";
import { CommentableEntityType } from "~/types/comment";
import { LikeableEntityType } from "~/types/like";

import { Comments } from "../Comments/comments";
import { ImageCarousel } from "../Photos/image-carousel";

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
  const locale = useLocale();
  const utils = api.useUtils();
  const { toast } = useToast();
  const t = useTranslations("Plants");

  const [isSocial, setIsSocial] = useState(isSocialProp);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
      toast({
        title: "Success",
        description: "Plant deleted successfully",
      });
      // Invalidate and prefetch the plants query to refresh the list
      await utils.plants.getOwnPlants.invalidate();
      // await utils.plants.getOwnPlants.prefetch();
      // router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete plant",
        variant: "destructive",
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

  return (
    <>
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={confirmDelete}
        isDeleting={deleteMutation.isPending}
        title="Are you sure you want to remove this plant?"
        description="No photo will be deleted by this action. But this will also remove all references in any photos where this plant is tagged!"
        alertCautionText="This action also deletes all feedings and other events referring to this plant!"
      />

      <Card className="my-2 flex flex-col overflow-hidden">
        {isSocial && <AvatarCardHeader user={plant.owner} />}

        <CardContent
          className={`grid gap-2 ${isSocial ? "ml-11 pl-0 pr-2" : "p-2"}`}
        >
          {/* Image Carousel */}
          <ImageCarousel plantImages={plant.plantImages} />

          {/* Title Link */}
          <div className="flex items-center justify-between">
            <CardTitle as="h3">
              <Button asChild variant="link" className="p-1">
                <Link
                  href={`/public/plants/${plant.id}`}
                  className="flex items-center gap-2"
                >
                  <Tag className="mt-1" size={20} />
                  {plant.name}
                </Link>
              </Button>
            </CardTitle>
            {/* Switch for toggling isSocial */}
            {user && user.id === plant.ownerId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontalIcon className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!isSocialProp && (
                    <DropdownMenuItem className="flex items-center justify-start">
                      <MessageCircleIcon className="mr-2 h-4 w-4" />
                      <Label
                        className="cursor-pointer text-sm font-semibold"
                        htmlFor="show-socialMode"
                      >
                        Social
                      </Label>
                      <Switch
                        className="ml-auto"
                        id="show-socialMode"
                        checked={isSocial}
                        onCheckedChange={setIsSocial}
                      />
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link
                      target="_blank"
                      href={`/public/plants/${plant.id}`}
                      className="flex cursor-pointer items-center"
                    >
                      <ExternalLinkIcon className="mr-2 h-4 w-4" />
                      {t("public-link-label")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/plants/${plant.id}/form`}
                      className="flex cursor-pointer items-center"
                    >
                      <EditIcon className="mr-2 h-4 w-4" />
                      {t("edit-plant-button-label")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="bg-destructive/50 text-foreground focus:bg-destructive focus:text-white focus:outline-none"
                  >
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full justify-start"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 size={20} className="mr-2 animate-spin" />
                      ) : (
                        <Trash2Icon className="mr-2 h-4 w-4" />
                      )}
                      {t("delete-plant-button-label")}
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Strain Info */}
          <CardDescription>
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
          </CardDescription>

          {/* Plant Progress and Dates */}
          <Card className="space-y-4 p-2 sm:p-4 md:p-6">
            <CardHeader className="flex w-full flex-col p-0">
              <div className="mb-1 flex justify-between text-sm">
                <span>{t("growth-progress")}</span>
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex cursor-default items-center font-mono text-sm font-semibold tracking-tighter">
                      <Nut className={`mr-2 h-4 w-4 text-planted`} />
                      {formatDate(plant.startDate, locale)}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-transparent">
                      <Badge
                        variant={"outline"}
                        className="whitespace-nowrap border-0 bg-planted text-sm text-white"
                      >
                        {t("planting-date")}
                      </Badge>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex h-4 items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex cursor-default items-center font-mono text-sm font-semibold tracking-tighter">
                      <Sprout
                        className={`mr-2 h-4 w-4 ${
                          plant.seedlingPhaseStart
                            ? "text-seedling"
                            : "text-seedling/40"
                        }`}
                      />
                      {plant.seedlingPhaseStart &&
                        formatDate(plant.seedlingPhaseStart, locale)}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-transparent">
                      <Badge
                        variant={"outline"}
                        className="whitespace-nowrap border-0 bg-seedling text-sm text-white"
                      >
                        {t("germination-date")}
                      </Badge>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex h-4 items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex cursor-default items-center font-mono text-sm font-semibold tracking-tighter">
                      <Leaf
                        className={`mr-2 h-4 w-4 ${
                          plant.vegetationPhaseStart
                            ? "text-vegetation"
                            : "text-vegetation/40"
                        }`}
                      />
                      {plant.vegetationPhaseStart &&
                        formatDate(plant.vegetationPhaseStart, locale)}
                    </TooltipTrigger>

                    <TooltipContent side="right" className="bg-transparent">
                      <Badge
                        variant={"outline"}
                        className="whitespace-nowrap border-0 bg-vegetation text-sm text-white"
                      >
                        {t("vegetation-start-date")}
                      </Badge>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex h-4 items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex cursor-default items-center font-mono text-sm font-semibold tracking-tighter">
                      <Flower2
                        className={`mr-2 h-4 w-4 ${
                          plant.floweringPhaseStart
                            ? "text-flowering"
                            : "text-flowering/40"
                        }`}
                      />
                      {plant.floweringPhaseStart &&
                        formatDate(plant.floweringPhaseStart, locale)}
                    </TooltipTrigger>

                    <TooltipContent side="right" className="bg-transparent">
                      <Badge
                        variant={"outline"}
                        className="whitespace-nowrap border-0 bg-flowering text-sm text-white"
                      >
                        {t("flowering-start-date")}
                      </Badge>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex h-4 items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex cursor-default items-center font-mono text-sm font-semibold tracking-tighter">
                      <Wheat
                        className={`mr-2 h-4 w-4 ${
                          plant.harvestDate ? "text-harvest" : "text-harvest/40"
                        }`}
                      />
                      {plant.harvestDate &&
                        formatDate(plant.harvestDate, locale)}
                    </TooltipTrigger>

                    <TooltipContent side="right" className="bg-transparent">
                      <Badge
                        variant={"outline"}
                        className="whitespace-nowrap bg-harvest text-sm text-white"
                      >
                        {t("harvest-date")}
                      </Badge>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex h-4 items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex cursor-default items-center font-mono text-sm font-semibold tracking-tighter">
                      <PillBottle
                        className={`mr-2 h-4 w-4 ${
                          plant.curingPhaseStart
                            ? "text-curing"
                            : "text-curing/40"
                        }`}
                      />
                      {plant.curingPhaseStart &&
                        formatDate(plant.curingPhaseStart, locale)}
                    </TooltipTrigger>

                    <TooltipContent side="right" className="bg-transparent">
                      <Badge
                        variant={"outline"}
                        className="whitespace-nowrap bg-curing text-sm text-white"
                      >
                        {t("curing-start-date")}
                      </Badge>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        </CardContent>

        {
          isSocial && (
            // Social Footer
            <SocialCardFooter
              className={`pb-2 pr-2 ${isSocial && "ml-11"}`}
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
    </>
  );
}
