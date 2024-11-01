"use client";

// src/app/[locale]/(protected)/grows/[id]/connect-plants/page.tsx:
// import { useParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion";
import { Check, Flower2, Workflow } from "lucide-react";
import { useState } from "react";
import { Grow, Plant } from "~/components/features/timeline/post";
import PageHeader from "~/components/layouts/page-header";
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
      title: "Plants Assigned",
      description: `Successfully assigned ${plantsToConnect.length} plants to ${grow.name}`,
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
        title: "Plant Unassigned",
        description: "Plant has been unassigned from this Grow.",
      });
    }
  };

  return (
    <PageHeader
      title={"Assign Plants to your Grow"}
      subtitle={`Assign or unassign plants to/from ${grow.name}`}
    >
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Available Plants (unassigned)</CardTitle>
            <CardDescription>
              Select plants to assign to this Grow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Command className="rounded-lg border shadow-md">
              <CommandInput
                placeholder="Search plants..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>No plants found.</CommandEmpty>
                <CommandGroup>
                  <AnimatePresence>
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
                        <motion.div
                          key={plant.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CommandItem
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
                            <Badge
                              variant="secondary"
                              className="ml-auto uppercase"
                            >
                              {plant.growPhase}
                            </Badge>
                          </CommandItem>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </CommandGroup>
              </CommandList>
            </Command>
            <Button
              onClick={handleConnectPlants}
              disabled={selectedPlants.size === 0}
              className="w-full"
            >
              <Workflow />
              Assign Selected Plants to Grow
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{grow.name}</CardTitle>
            <CardDescription>
              Plants currently assigned to this grow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AnimatePresence>
                {grow.plants.map((plant) => (
                  <motion.div
                    key={plant.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-primary/40 bg-background text-foreground shadow-sm">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <Flower2 strokeWidth={0.9} className="h-12 w-12" />
                          <div>
                            <p className="text-base font-semibold">
                              {plant.strain}
                            </p>
                            <Badge variant="secondary" className="uppercase">
                              {plant.growPhase}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemovePlant(plant.id)}
                        >
                          Unassign
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              {grow.plants.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  No plants assigned yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageHeader>
  );
}
