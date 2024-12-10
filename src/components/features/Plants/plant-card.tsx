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
  Wheat,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import headerImagePlaceholder from "~/assets/landscape-placeholdersvg.svg";
import { DeleteConfirmationDialog } from "~/components/atom/confirm-delete";
import { SocialCardFooter } from "~/components/atom/social-card-footer";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useLikeStatus } from "~/hooks/use-likes";
import { useToast } from "~/hooks/use-toast";
import { Link, useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import { calculateGrowthProgress, formatDate } from "~/lib/utils";
import { GetOwnPlantType } from "~/server/api/root";
import { LikeableEntityType } from "~/types/like";

interface PlantCardProps {
  plant: GetOwnPlantType;
  isSocial: boolean;
}

export default function PlantCard({ plant, isSocial }: PlantCardProps) {
  const locale = useLocale();
  const router = useRouter();
  const utils = api.useUtils();
  const { toast } = useToast();
  const user = useSession().data?.user;

  const { isLiked, likeCount, isLoading } = useLikeStatus(
    plant.id,
    LikeableEntityType.Plant,
  );

  const [isImageHovered, setIsImageHovered] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  const t = useTranslations("Plants");

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={confirmDelete}
        isDeleting={deleteMutation.isPending}
        title="Are you sure you want to remove this plant?"
        description="No photo will be deleted by this action. But this will also remove all references in any photos where this plant is tagged!"
        alertCautionText="This action also deletes all feedings and other events referring to this plant!"
      />

      <Card className="overflow-hidden">
        <CardHeader
          className="relative aspect-video p-0"
          onMouseEnter={() => setIsImageHovered(true)}
          onMouseLeave={() => setIsImageHovered(false)}
        >
          <Image
            src={plant.headerImage?.imageUrl ?? headerImagePlaceholder}
            alt={plant.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-300"
            style={{
              transform: isImageHovered ? "scale(1.05)" : "scale(1)",
            }}
          />
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle>{plant.name}</CardTitle>
          <CardDescription className="my-1 flex gap-1">
            <span>Strain: {plant.strain?.name ?? "Unknown"}</span>
            <span>|</span>
            <span>Breeder: {plant.strain?.breeder.name ?? "Unknown"}</span>
          </CardDescription>
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
                    {plant.harvestDate && formatDate(plant.harvestDate, locale)}
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
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </div>
        </CardContent>

        {user && user.id === plant.ownerId && (
          <CardFooter className="flex w-full gap-1 p-2">
            <Button
              variant="destructive"
              size={"sm"}
              className="w-16"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Trash2 size={20} />
              )}
            </Button>
            <Button asChild size={"sm"} variant="primary" className="w-full">
              <Link href={`/plants/${plant.id}/form`}>
                <Edit size={20} />
                {t("edit-plant-button-label")}
              </Link>
            </Button>
          </CardFooter>
        )}

        {isSocial && (
          <SocialCardFooter
            entityId={plant.id}
            entityType={LikeableEntityType.Plant}
            initialLiked={isLiked}
            isLikeStatusLoading={isLoading}
            stats={{
              comments: 0,
              views: 0,
              likes: likeCount,
            }}
          />
        )}
      </Card>
    </>
  );
}
