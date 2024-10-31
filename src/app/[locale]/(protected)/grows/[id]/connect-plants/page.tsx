"use client";

// src/app/[locale]/(protected)/grows/[id]/connect-plants/page.tsx:
// import { useParams } from "next/navigation"
import { Check, Flower2, Leaf } from "lucide-react";
import { useState } from "react";
import { Grow, Plant } from "~/components/features/timeline/post";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { useToast } from "~/hooks/use-toast";

// Mock data
const mockGrow: Grow = {
  id: "1",
  name: "Indoor Grow 2024",
  startDate: new Date("2024-01-01"),
  type: "indoor",
  plants: [
    { id: "p1", strain: "Northern Lights", growPhase: "vegetation" },
    { id: "p2", strain: "White Widow", growPhase: "flowering" },
  ],
};

const initialAvailablePlants: Plant[] = [
  { id: "p3", strain: "Blue Dream", growPhase: "seedling" },
  { id: "p4", strain: "Girl Scout Cookies", growPhase: "vegetation" },
  { id: "p5", strain: "Purple Haze", growPhase: "vegetation" },
  { id: "p6", strain: "OG Kush", growPhase: "flowering" },
];

export default function ConnectPlantsPage() {
  const { toast } = useToast();
  //   const params = useParams()
  //   const growId = params.id as string
  const [grow, setGrow] = useState<Grow>(mockGrow);
  const [selectedPlants, setSelectedPlants] = useState<Set<string>>(new Set());
  const [availablePlants, setAvailablePlants] = useState<Plant[]>(
    initialAvailablePlants,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const handleTogglePlant = (plantId: string) => {
    const newSelected = new Set(selectedPlants);
    if (newSelected.has(plantId)) {
      newSelected.delete(plantId);
    } else {
      newSelected.add(plantId);
    }
    setSelectedPlants(newSelected);
  };

  const handleConnectPlants = () => {
    const plantsToConnect = availablePlants.filter((p) =>
      selectedPlants.has(p.id),
    );
    const updatedGrow = {
      ...grow,
      plants: [...grow.plants, ...plantsToConnect],
    };
    setGrow(updatedGrow);
    setAvailablePlants((prevAvailable) =>
      prevAvailable.filter((p) => !selectedPlants.has(p.id)),
    );
    setSelectedPlants(new Set());
    toast({
      title: "Plants Connected",
      description: `Successfully connected ${plantsToConnect.length} plants to ${grow.name}`,
    });
  };

  const handleRemovePlant = (plantId: string) => {
    const plantToRemove = grow.plants.find((p) => p.id === plantId);
    if (plantToRemove) {
      const updatedGrow = {
        ...grow,
        plants: grow.plants.filter((p) => p.id !== plantId),
      };
      setGrow(updatedGrow);
      setAvailablePlants((prevAvailable) => [...prevAvailable, plantToRemove]);
      toast({
        title: "Plant Removed",
        description:
          "Successfully removed plant from grow and added back to available plants.",
      });
    }
  };

  return (
    <div className="container mx-auto space-y-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Connect Plants</h1>
          <p className="text-muted-foreground">
            Add or remove plants from {grow.name}
          </p>
        </div>
        <Button
          onClick={handleConnectPlants}
          disabled={selectedPlants.size === 0}
        >
          Connect Selected Plants
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Available Plants</CardTitle>
            <CardDescription>
              Select plants to connect to this grow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Command className="rounded-lg border shadow-md">
              <CommandInput
                placeholder="Search plants..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>No plants found.</CommandEmpty>
                <CommandGroup>
                  {availablePlants
                    .filter(
                      (p) =>
                        !grow.plants.some((gp) => gp.id === p.id) &&
                        (searchQuery === "" ||
                          p.strain
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())),
                    )
                    .map((plant) => (
                      <CommandItem
                        key={plant.id}
                        onSelect={() => handleTogglePlant(plant.id)}
                        className="cursor-pointer"
                      >
                        <div
                          className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
                            selectedPlants.has(plant.id)
                              ? "border-primary bg-primary"
                              : "border-primary"
                          }`}
                        >
                          {selectedPlants.has(plant.id) && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <Flower2 className="mr-2 h-4 w-4" />
                        <span>{plant.strain}</span>
                        <Badge variant="secondary" className="ml-auto">
                          {plant.growPhase}
                        </Badge>
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{grow.name} </CardTitle>
            <CardDescription>
              Currently connected plants in this grow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {grow.plants.map((plant) => (
                <div
                  key={plant.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <Leaf className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">{plant.strain}</p>
                      <p className="text-sm text-muted-foreground">
                        {plant.growPhase}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePlant(plant.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              {grow.plants.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  No plants connected yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
