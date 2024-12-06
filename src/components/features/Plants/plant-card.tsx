// src/components/features/plant/plant-card.tsx:
import { TooltipProvider } from "@radix-ui/react-tooltip";
import {
  Edit,
  Flower2,
  Leaf,
  Loader2,
  Nut,
  Sprout,
  Trash2,
  Wheat,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import headerImagePlaceholder from "~/assets/landscape-placeholdersvg.svg";
import { DeleteConfirmationDialog } from "~/components/atom/confirm-delete";
import { LikeButton } from "~/components/atom/like";
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

interface PlantCardProps {
  plant: GetOwnPlantType;
}

export default function PlantCard({ plant }: PlantCardProps) {
  const locale = useLocale();
  const router = useRouter();
  const utils = api.useUtils();
  const { toast } = useToast();

  const [isImageHovered, setIsImageHovered] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { isLiked, likeCount, isLoading } = useLikeStatus(plant.id, "plant");

  // Initialize delete mutation
  const deleteMutation = api.plant.deleteById.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Plant deleted successfully",
      });
      // Invalidate and prefetch the plants query to refresh the list
      await utils.plant.getOwnPlants.invalidate();
      await utils.plant.getOwnPlants.prefetch();
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
      <Card className="overflow-hidden">
        <CardHeader className="p-0">
          <div
            className="relative aspect-video"
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
          </div>
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
                    <Nut className="text-planted mr-2 h-4 w-4" />
                    {formatDate(plant.startDate, locale)}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-transparent">
                    <Badge
                      variant={"outline"}
                      className="bg-planted whitespace-nowrap border-0 text-sm"
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
                      className="whitespace-nowrap border-0 bg-seedling text-sm"
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
                      className="whitespace-nowrap border-0 bg-vegetation text-sm"
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
                      className="whitespace-nowrap border-0 bg-flowering text-sm"
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
                      className="whitespace-nowrap bg-harvest text-sm"
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
                    <Wheat className="mr-2 h-4 w-4 text-curing" />
                    {plant.curingPhaseStart &&
                      formatDate(plant.curingPhaseStart, locale)}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-transparent">
                    <Badge
                      variant={"outline"}
                      className="whitespace-nowrap bg-curing text-sm"
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

        <CardFooter className="flex w-full gap-1 p-2">
          <Button
            variant="destructive"
            size={"sm"}
            className="w-14"
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
        <SocialCardFooter
          entityId={plant.id}
          entityType={"plant"}
          initialLiked={isLiked}
          isLikeStatusLoading={isLoading}
          stats={{
            comments: 0,
            views: 0,
            likes: likeCount,
          }}
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={confirmDelete}
        isDeleting={deleteMutation.isPending}
        title="Are you sure you want to remove this plant? "
        description="This action will also delete all references to this plant in your photos. This cannot be undone."
        importantInfo="No photo will be deleted by this action!"
      />
    </>
  );
}
