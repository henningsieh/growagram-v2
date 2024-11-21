"use client";

// src/components/features/Images/connect-plants.tsx:
import { CheckedState } from "@radix-ui/react-checkbox";
import { TRPCClientError } from "@trpc/client";
import Image from "next/image";
import { memo, useCallback, useMemo, useState } from "react";
import headerImagePlaceholder from "~/assets/landscape-placeholdersvg.svg";
import SpinningLoader from "~/components/Layouts/loader";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/lib/trpc/react";
import { cn } from "~/lib/utils";
import { GetOwnPlantsInput, ImageById, OwnPlant } from "~/server/api/root";

interface ConnectPlantsProps {
  image: ImageById;
}

export default function ConnectPlants({ image }: ConnectPlantsProps) {
  const { toast } = useToast();
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
      <CardContent className="relative aspect-square w-full">
        <Image
          priority
          alt="Plant image"
          src={image.imageUrl}
          fill
          sizes="(max-width: 767px) 100vw, 800px"
          className="object-contain"
        />
      </CardContent>
      <CardContent>
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

const PlantCard = memo(function PlantCard({
  plant,
  isSelected,
  onToggle,
}: {
  plant: OwnPlant;
  isSelected: boolean;
  onToggle: (checked: CheckedState) => void;
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-sm p-1 transition-all",
        isSelected && "ring-2 ring-secondary",
      )}
    >
      <CardContent className="flex h-full flex-col p-1">
        <div className="flex flex-grow items-stretch space-x-4">
          <div className="relative aspect-video w-2/3 flex-shrink-0">
            <Image
              alt={plant.name}
              src={plant.headerImage?.imageUrl || headerImagePlaceholder}
              sizes="(max-width: 639px) 100vw, 33vw" // matches parent grid: cols-1 or sm:cols-3
              fill
              style={{ objectFit: "cover" }}
              className="rounded-tl"
              priority
            />
          </div>
          <div className="flex flex-grow items-center justify-center">
            <Checkbox
              className="h-12 w-12"
              checked={isSelected}
              onCheckedChange={onToggle}
            />
          </div>
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
        </div>
        <h3 className="mt-2 text-lg font-semibold">{plant.name}</h3>
      </CardContent>
    </Card>
  );
});
