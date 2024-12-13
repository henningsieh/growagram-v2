// src/components/features/plant/plant-card.tsx:
import { TooltipProvider } from "@radix-ui/react-tooltip";
import {
  Edit,
  Flower2,
  Leaf,
  Loader2,
  Nut,
  PillBottle,
  Sprout,
  Trash2,
  User2,
  Wheat,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import headerImagePlaceholder from "~/assets/landscape-placeholdersvg.svg";
import { DeleteConfirmationDialog } from "~/components/atom/confirm-delete";
import { SocialCardFooter } from "~/components/atom/social-card-footer";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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
import { Progress } from "~/components/ui/progress";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useComments } from "~/hooks/use-comments";
import { useLikeStatus } from "~/hooks/use-likes";
import { useToast } from "~/hooks/use-toast";
import { Link, useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import { calculateGrowthProgress, formatDate } from "~/lib/utils";
import { GetOwnPlantType } from "~/server/api/root";
import { CommentableEntityType } from "~/types/comment";
import { LikeableEntityType } from "~/types/like";

import { ItemComments } from "../Comments/item-comments";

interface PlantCardProps {
  plant: GetOwnPlantType;
  isSocial?: boolean;
}

export default function PlantCard({ plant, isSocial = true }: PlantCardProps) {
  const locale = useLocale();
  const router = useRouter();
  const utils = api.useUtils();
  const { toast } = useToast();
  const t = useTranslations("Plants");

  const [isImageHovered, setIsImageHovered] = useState(false);
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
      await utils.plants.getOwnPlants.prefetch();
      router.refresh();
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

  const progress = calculateGrowthProgress(
    plant.startDate,
    plant.floweringPhaseStart,
  );

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
        {isSocial && (
          <CardHeader className="space-y-0 p-2">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={plant.owner?.image as string | undefined} />
                  <AvatarFallback>
                    <User2 className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">{plant.owner?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {`@${plant.owner?.name}`}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
        )}

        <CardContent
          className={`grid gap-4 ${isSocial ? "ml-14 p-2 pl-0" : "p-4"}`}
        >
          <div
            className="relative aspect-video overflow-hidden"
            onMouseEnter={() => setIsImageHovered(true)}
            onMouseLeave={() => setIsImageHovered(false)}
          >
            <Image
              src={plant.headerImage?.imageUrl ?? headerImagePlaceholder}
              alt={plant.name}
              fill
              className="object-cover transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              style={{
                transform: isImageHovered ? "scale(1.05)" : "scale(1)",
              }}
            />
          </div>

          <div>
            <CardHeader className="p-0">
              <Link href={`/public/plants/${plant.id}`}>
                <CardTitle level="h3">
                  <div className="flex w-full items-center gap-2">
                    <Sprout size={20} />
                    <h3 className="text-xl font-bold">{plant.name}</h3>
                  </div>
                </CardTitle>
              </Link>
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
            </CardHeader>
          </div>

          <div className="space-y-4">
            <div className="mt-4 space-y-2">
              <div className="flex h-4 items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex cursor-default items-center font-mono text-sm font-semibold tracking-tighter">
                      <Nut className="mr-2 h-4 w-4 text-planted" />
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
                      <Sprout className="mr-2 h-4 w-4 text-seedling" />
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
                      <Leaf className="mr-2 h-4 w-4 text-vegetation" />
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
                      <Flower2 className="mr-2 h-4 w-4 text-flowering" />
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
                      <Wheat className="mr-2 h-4 w-4 text-harvest" />
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
                      <PillBottle className="mr-2 h-4 w-4 text-curing" />
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
            </div>

            <div className="mt-4 flex justify-between">
              <div className="w-full">
                <div className="mb-1 flex justify-between text-sm">
                  <span>{t("growth-progress")}</span>
                  <span>
                    {
                      progress
                      // eslint-disable-next-line react/jsx-no-literals
                    }
                    %
                  </span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            </div>
          </div>
        </CardContent>

        {isSocial ? (
          <SocialCardFooter
            className={`pb-2 pr-2 ${isSocial && "ml-14"}`}
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
        ) : (
          <>
            <Separator />
            <CardFooter className="flex w-full justify-between gap-1 p-1">
              <Button
                variant="destructive"
                size="sm"
                className="w-20"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Trash2 size={20} />
                )}
              </Button>
              <Button asChild size="sm" className="w-full text-base">
                <Link href={`/plants/${plant.id}/form`}>
                  <Edit size={20} />
                  {t("edit-plant-button-label")}
                </Link>
              </Button>
            </CardFooter>
          </>
        )}

        {isSocial && isCommentsOpen && (
          <ItemComments
            entityId={plant.id}
            entityType={CommentableEntityType.Plant}
            isSocial={isSocial}
          />
        )}
      </Card>
    </>
  );
}
