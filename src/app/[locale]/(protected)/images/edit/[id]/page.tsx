"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useParams } from "next/navigation";
import * as React from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/lib/trpc/react";
import { cn } from "~/lib/utils";

export default function EditImage() {
  const { id: imageId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [selectedPlantId, setSelectedPlantId] = React.useState<string>("");

  const { data: plantsData, isLoading: isPlantsLoading } =
    api.plant.getOwnPlants.useQuery({
      limit: 100,
      cursor: null,
    });

  const connectPlantMutation = api.image.connectPlant.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Plant connected to image successfully",
      });
      setSelectedPlantId("");
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to connect plant to image",
        variant: "destructive",
      });
    },
  });

  const handleConnectPlant = async () => {
    if (!selectedPlantId || !imageId) return;

    connectPlantMutation.mutate({
      imageId,
      plantId: selectedPlantId,
    });
  };

  const getSelectedPlantName = () => {
    if (!selectedPlantId || !plantsData?.plants) return "Select a plant...";
    const plant = plantsData.plants.find((p) => p.id === selectedPlantId);
    return plant?.name || "Select a plant...";
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Connect Image to Plant</CardTitle>
        <CardDescription>
          Select a plant to connect with this image
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
                disabled={isPlantsLoading}
              >
                {isPlantsLoading ? (
                  <span>Loading plants...</span>
                ) : (
                  getSelectedPlantName()
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <div className="max-h-[300px] overflow-y-auto">
                {isPlantsLoading ? (
                  <div className="p-2 text-sm">Loading plants...</div>
                ) : plantsData?.plants && plantsData.plants.length > 0 ? (
                  plantsData.plants.map((plant) => (
                    <Button
                      key={plant.id}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedPlantId(
                          plant.id === selectedPlantId ? "" : plant.id,
                        );
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedPlantId === plant.id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {plant.name}
                      {plant.strain && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          ({plant.strain.name})
                        </span>
                      )}
                    </Button>
                  ))
                ) : (
                  <div className="p-2 text-sm">No plants available</div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            onClick={handleConnectPlant}
            disabled={!selectedPlantId || connectPlantMutation.isPending}
            className="w-full"
          >
            {connectPlantMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Connecting...
              </div>
            ) : (
              "Connect to Plant"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
