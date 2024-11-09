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
  const [selectedPlantIds, setSelectedPlantIds] = React.useState<string[]>([]);

  const { data, isLoading } = api.plant.getOwnPlants.useQuery({
    limit: 100,
    cursor: null,
  });

  const plants = data?.plants;

  const connectPlantMutation = api.image.connectPlant.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Plant connected to image successfully",
      });
      setSelectedPlantIds([]);
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
    if (!selectedPlantIds.length || !imageId) return;

    for (const plantId of selectedPlantIds) {
      await connectPlantMutation.mutateAsync({
        imageId,
        plantId,
      });
    }

    setSelectedPlantIds([]);
    setOpen(false);
  };

  const getSelectedPlantNames = () => {
    if (!selectedPlantIds.length || !plants) return "Select plants...";
    const selectedPlants = plants.filter((p) =>
      selectedPlantIds.includes(p.id),
    );
    return selectedPlants.map((p) => p.name).join(", ") || "Select plants...";
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Connect Plants to Image</CardTitle>
        <CardDescription>
          Select all plants beeing seen on this image
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>Loading plants...</span>
                ) : (
                  getSelectedPlantNames()
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <div className="max-h-[300px] overflow-y-auto">
                {isLoading ? (
                  <div className="p-2 text-sm">Loading plants...</div>
                ) : plants && plants.length > 0 ? (
                  plants.map((plant) => (
                    <Button
                      key={plant.id}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedPlantIds((prev) =>
                          prev.includes(plant.id)
                            ? prev.filter((id) => id !== plant.id)
                            : [...prev, plant.id],
                        );
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedPlantIds.includes(plant.id)
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
            disabled={
              !selectedPlantIds.length || connectPlantMutation.isPending
            }
            className="w-full"
          >
            {connectPlantMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Connecting...
              </div>
            ) : (
              `Connect to ${selectedPlantIds.length} Plant${selectedPlantIds.length !== 1 ? "s" : ""}`
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
