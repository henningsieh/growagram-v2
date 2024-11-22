"use client";

// src/components/features/Images/identify-plants.tsx:
import { TRPCClientError } from "@trpc/client";
import { Camera, FileIcon, UploadCloud } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { memo, useCallback, useMemo, useState } from "react";
import headerImagePlaceholder from "~/assets/landscape-placeholdersvg.svg";
import SpinningLoader from "~/components/Layouts/loader";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/lib/trpc/react";
import { cn, formatDate, formatTime } from "~/lib/utils";
import { ImageById, OwnPlant } from "~/server/api/root";

interface ConnectPlantsProps {
  image: ImageById;
}

export default function ConnectPlants({ image }: ConnectPlantsProps) {
  const { toast } = useToast();
  const locale = useLocale();
  const utils = api.useUtils();

  /**
   * Mutation to connect a plant to an image.
   *
   * On success, invalidates the cache for the image to ensure updated data.
   */
  const connectPlantMutation = api.image.connectPlant.useMutation({
    onSuccess: async () => {
      await utils.image.getById.invalidate({ id: image.id });
    },
  });

  /**
   * Mutation to disconnect a plant from an image.
   *
   * On success, invalidates the cache for the image to ensure updated data.
   */
  const disconnectPlantMutation = api.image.disconnectPlant.useMutation({
    onSuccess: async () => {
      await utils.image.getById.invalidate({ id: image.id });
    },
  });

  // The prefetched data will be available in the cache
  const initialData = utils.plant.getOwnPlants.getData();

  const {
    data: plantsData,
    isLoading,
    isFetching,
    isPending,
  } = api.plant.getOwnPlants.useQuery(undefined, {
    // Use the data that was prefetched on the server
    initialData: initialData,
  });
  const plants = plantsData?.plants || [];

  // Initialize with connected plants
  const initialSelectedPlantIds = useMemo(
    () => image.plantImages.map((plantImage) => plantImage.plant.id),
    [image.plantImages],
  );

  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>(
    initialSelectedPlantIds,
  );

  /**
   * Handles connecting and disconnecting plants to an image.
   *
   * This function compares the currently connected plants for an image with
   * the user-selected plants. It determines which plants need to be connected
   * or disconnected and performs these operations asynchronously. Upon success,
   * it invalidates the cache and displays a success toast. If any operation
   * fails, it displays an error toast.
   *
   * @async
   * @function handleConnectPlants
   * @returns {Promise<void>} A promise that resolves when the operations complete.
   */
  const handleConnectPlants = useCallback(async () => {
    if (!image.id) return;

    const currentConnectedPlants = new Set(
      image.plantImages.map((pi) => pi.plant.id),
    );

    const plantsToConnect = selectedPlantIds.filter(
      (id) => !currentConnectedPlants.has(id),
    );
    const plantsToDisconnect = Array.from(currentConnectedPlants).filter(
      (id) => !selectedPlantIds.includes(id),
    );

    try {
      await Promise.all([
        ...plantsToConnect.map((plantId) =>
          connectPlantMutation.mutateAsync({
            imageId: image.id,
            plantId: plantId,
          }),
        ),
        ...plantsToDisconnect.map((plantId) =>
          disconnectPlantMutation.mutateAsync({
            imageId: image.id,
            plantId: plantId,
          }),
        ),
      ]);

      // Show success toast only after all operations complete successfully
      toast({
        title: "Success",
        description: "Plants updated successfully",
      });
      utils.image.getOwnImages.invalidate();
    } catch (error) {
      // Show error toast when any operation fails
      toast({
        title: "Error",
        description:
          error instanceof TRPCClientError
            ? error.message
            : "Failed to update connected plants",
        variant: "destructive",
      });
    }
  }, [
    image.id,
    image.plantImages,
    selectedPlantIds,
    toast,
    utils.image.getOwnImages,
    connectPlantMutation,
    disconnectPlantMutation,
  ]);

  const togglePlantSelection = useCallback((plantId: string) => {
    setSelectedPlantIds((prev) =>
      prev.includes(plantId)
        ? prev.filter((id) => id !== plantId)
        : [...prev, plantId],
    );
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Plants to Image</CardTitle>
        <CardDescription>
          Choose all the plants you can spot in this picture
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="mx-6 flex flex-col gap-2 sm:flex-row">
          <div className="relative h-[300px] w-full sm:w-2/5">
            <Image
              priority
              alt="Plant image"
              src={image.imageUrl}
              fill
              sizes="(max-width: 767px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <Card className="w-full rounded-sm bg-muted/30 hover:shadow-none sm:w-3/5 sm:pt-0">
            <CardHeader className="p-2">
              <CardTitle className="m-0">
                <div className="text-2xl font-semibold">Image Details</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-2">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <FileIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="text-sm font-medium">Filename:</span>
                </div>

                <div className="flex overflow-hidden">
                  <span className="break-all text-xs text-muted-foreground">
                    {image.originalFilename}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Camera className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="text-sm font-medium">Capture Date:</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDate(image.captureDate, locale)}
                  <span className="hidden sm:inline-block">
                    {locale !== "en" ? " um " : " at "}
                    {formatTime(image.captureDate, locale)}
                    {locale !== "en" && " Uhr"}
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <UploadCloud className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="whitespace-nowrap text-sm font-medium">
                    Upload Date:
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDate(image.createdAt, locale)}
                  <span className="hidden sm:inline-block">
                    {locale !== "en" ? " um " : " at "}
                    {formatTime(image.createdAt, locale)}
                    {locale !== "en" && " Uhr"}
                  </span>
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <div>
                  <Badge variant="outline">Image-ID: {image.id}</Badge>
                </div>

                <div>
                  <Badge variant="outline">
                    Owner-ID: {image.ownerId.slice(0, 16)}...
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
      <CardContent className="p-6">
        <ScrollArea className="h-[calc(50vh)] w-full rounded-md border p-4">
          {isLoading || !plantsData || !plants.length ? (
            <SpinningLoader />
          ) : (
            <div className="grid grid-cols-1 gap-4 p-1 sm:grid-cols-3">
              {plants.length &&
                plants.map((plant) => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    isSelected={selectedPlantIds.includes(plant.id)}
                    onToggle={() => togglePlantSelection(plant.id)}
                  />
                ))}
              {!isLoading && plants.length === 0 && (
                <div className="col-span-full text-center text-sm text-muted-foreground">
                  No plants available
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <Button
          onClick={handleConnectPlants}
          disabled={connectPlantMutation.isPending}
          className="mt-4 w-full"
        >
          {connectPlantMutation.isPending ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Updating...
            </div>
          ) : (
            `Update Connected Plants (${selectedPlantIds.length})`
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

interface PlantCardProps {
  plant: OwnPlant;
  isSelected: boolean;
  onToggle: () => void;
}

const PlantCard = memo(function PlantCard({
  plant,
  isSelected,
  onToggle,
}: PlantCardProps) {
  return (
    <Card
      onClick={onToggle}
      className={cn(
        "cursor-pointer overflow-hidden rounded-lg p-2 transition-all",
        isSelected
          ? "bg-secondary/10 ring-2 ring-secondary"
          : "hover:bg-muted/10",
      )}
    >
      <CardContent className="flex flex-col items-center">
        <div className="relative mb-2 aspect-video w-full">
          <Image
            alt={plant.name}
            src={plant.headerImage?.imageUrl || headerImagePlaceholder}
            sizes="(max-width: 639px) 100vw, 33vw"
            fill
            className="rounded-md object-cover"
            priority
          />
        </div>
        <h3 className="text-center text-lg font-semibold">{plant.name}</h3>

        {/* {plant.strain && (
              <p className="text-sm text-muted-foreground">
                {plant.strain.name}
              </p>
            )}
            {plant.phase && (
              <p className="mt-1 text-sm">
                Phase: {plant.phase} {plant.daysInPhase && `(Day ${plant.daysInPhase})`}
              </p>
            )} */}
      </CardContent>
    </Card>
  );
});
