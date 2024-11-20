"use client";

import { CheckedState } from "@radix-ui/react-checkbox";
import { TRPCClientError } from "@trpc/client";
import Image from "next/image";
import { memo, useCallback, useState } from "react";
import headerImagePlaceholder from "~/assets/landscape-placeholdersvg.svg";
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

  // Initialize with connected plants
  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>(() =>
    image.plantImages.map((plantImage) => plantImage.plant.id),
  );

  // The prefetched data will be available in the cache
  const {
    data: plantsData,
    isLoading,
    isFetching,
    isPending,
  } = api.plant.getOwnPlants.useQuery({} satisfies GetOwnPlantsInput, {
    // Use the data that was prefetched on the server
    initialData: utils.plant.getOwnPlants.getData(),
  });

  const plants = plantsData?.plants || [];

  const connectPlantMutation = api.image.connectPlant.useMutation({
    onSuccess: async () => {
      await utils.image.getById.invalidate({ id: image.id });
    },
  });

  const disconnectPlantMutation = api.image.disconnectPlant.useMutation({
    onSuccess: async () => {
      await utils.image.getById.invalidate({ id: image.id });
    },
  });

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
            plantId,
          }),
        ),
        ...plantsToDisconnect.map((plantId) =>
          disconnectPlantMutation.mutateAsync({
            imageId: image.id,
            plantId,
          }),
        ),
      ]);

      // Show success toast only after all operations complete successfully
      toast({
        title: "Success",
        description: "Plants updated successfully",
      });
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
    selectedPlantIds,
    image.plantImages,
    connectPlantMutation,
    disconnectPlantMutation,
    toast,
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
        <CardDescription>Select all plants seen in this image</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(50vh)] w-full rounded-md border p-4">
          <div className="grid grid-cols-1 gap-4 p-1 sm:grid-cols-2 lg:grid-cols-3">
            {plants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                isSelected={selectedPlantIds.includes(plant.id)}
                onToggle={() => togglePlantSelection(plant.id)}
              />
            ))}
            {plants.length === 0 && (
              <div className="col-span-full text-center text-sm text-muted-foreground">
                No plants available
              </div>
            )}
          </div>
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
              src={plant.headerImage?.imageUrl || headerImagePlaceholder}
              alt={plant.name}
              fill
              objectFit="cover"
              className="rounded-tl"
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
