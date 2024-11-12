"use client";

import Image from "next/image";
import * as React from "react";
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
import { ImageById, OwnPlant } from "~/server/api/root";

interface EditImageProps {
  image: ImageById;
}

export default function ConnectPlants({ image }: EditImageProps) {
  const { toast } = useToast();

  const [selectedPlantIds, setSelectedPlantIds] = React.useState<string[]>(
    image.plantImages.map((pi) => pi.plant.id),
  );

  const { data, isLoading } = api.plant.getOwnPlants.useQuery({
    limit: 100,
    cursor: null,
  });
  const plants = data?.plants as OwnPlant[];

  const connectPlantMutation = api.image.connectPlant.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Plants connected to image successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to connect plants to image",
        variant: "destructive",
      });
    },
  });

  const disconnectPlantMutation = api.image.disconnectPlant.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Plants connected to image successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to connect plants to image",
        variant: "destructive",
      });
    },
  });

  const handleConnectPlants = async () => {
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

    for (const plantId of plantsToConnect) {
      await connectPlantMutation.mutateAsync({
        imageId: image.id,
        plantId: plantId,
      });
    }

    for (const plantId of plantsToDisconnect) {
      // Assuming you have a disconnectPlant mutation
      await disconnectPlantMutation.mutateAsync({
        imageId: image.id,
        plantId: plantId,
      });
    }
  };

  const togglePlantSelection = (plantId: string) => {
    setSelectedPlantIds((prev) =>
      prev.includes(plantId)
        ? prev.filter((id) => id !== plantId)
        : [...prev, plantId],
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Connect Plants to Image</CardTitle>
        <CardDescription>Select all plants seen in this image</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(40vh)] w-full rounded-md border p-4">
          <div className="grid grid-cols-1 gap-4 p-1 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div className="col-span-full flex h-full items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : plants && plants.length > 0 ? (
              plants.map((plant) => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  isSelected={selectedPlantIds.includes(plant.id)}
                  onToggle={() => togglePlantSelection(plant.id)}
                />
              ))
            ) : (
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

function PlantCard({
  plant,
  isSelected,
  onToggle,
}: {
  plant: OwnPlant;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-sm p-0 p-1 transition-all",
        isSelected && "ring-2 ring-secondary",
      )}
    >
      <CardContent className="p-1">
        <div className="flex items-start space-x-4">
          <div className="relative h-24 w-24 flex-shrink-0">
            <Image
              src={plant.headerImage?.imageUrl || "/placeholder.svg"}
              alt={plant.name}
              layout="fill"
              objectFit="cover"
              className="rounded-tl"
            />
          </div>
          <div className="flex-grow p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{plant.name}</h3>
              <Checkbox checked={isSelected} onCheckedChange={onToggle} />
            </div>
            {plant.strain && (
              <p className="text-sm text-muted-foreground">
                {plant.strain.name}
              </p>
            )}
            {/* {plant.phase && (
              <p className="mt-1 text-sm">
                Phase: {plant.phase} {plant.daysInPhase && `(Day ${plant.daysInPhase})`}
              </p>
            )} */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
