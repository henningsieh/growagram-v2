"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Flower2, SquarePlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import FormContent from "~/components/Layouts/form-content";
import PageHeader from "~/components/Layouts/page-header";
import { GrowCard } from "~/components/features/Grows/grow-card";
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
import { api } from "~/lib/trpc/react";
import { GetOwnPlantsInput, GetOwnPlantsType } from "~/server/api/root";

interface Grow {
  id: string;
  name: string;
  image: string;
  plants: GetOwnPlantsType;
  startDate: Date;
  updatedAt: Date;
  type: "indoor" | "outdoor";
}

export default function ConnectPlantsPage() {
  // Mock data (unchanged)
  const mockGrow: Grow = {
    id: "1",
    name: "Indoor Grow 2024",
    image: "/images/IMG_20241005_062601~2.jpg",
    startDate: new Date("2024-01-01"),
    updatedAt: new Date("2024-09-16"),
    type: "indoor",
    plants: [] as GetOwnPlantsType,
  };

  const { toast } = useToast();
  const [grow, setGrow] = useState<Grow>(mockGrow);
  const [selectedPlants, setSelectedPlants] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch plants query
  const {
    data: plantsData,
    isLoading: isPlantsLoading,
    isError: isPlantsError,
    error: plantsError,
  } = api.plant.getOwnPlants.useQuery({
    // limit: 2,
  } satisfies GetOwnPlantsInput);

  // Log the entire plants data for debugging
  useEffect(() => {
    console.log("Full Plants Data:", plantsData);
    console.log("Is Loading:", isPlantsLoading);
    console.log("Is Error:", isPlantsError);
    if (isPlantsError) {
      console.error("Plants Error:", plantsError);
    }
  }, [plantsData, isPlantsLoading, isPlantsError, plantsError]);

  // Manage available plants state
  const [availablePlants, setAvailablePlants] = useState<GetOwnPlantsType>([]);

  // Update available plants when data is fetched
  useEffect(() => {
    if (plantsData?.plants) {
      setAvailablePlants(plantsData.plants);
    }
  }, [plantsData]);

  // Filtering plants
  const filteredPlants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = availablePlants.filter(
      (p) =>
        !grow.plants.some((gp) => gp.id === p.id) &&
        p.name.toLowerCase().includes(query),
    );
    console.log("Filtered Plants:", filtered);
    return filtered;
  }, [availablePlants, grow.plants, searchQuery]);

  const handleTogglePlant = (plantId: string) => {
    setSelectedPlants((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(plantId)) {
        newSelected.delete(plantId);
      } else {
        newSelected.add(plantId);
      }
      return newSelected;
    });
  };

  const handleConnectPlants = () => {
    const plantsToConnect = availablePlants.filter((p) =>
      selectedPlants.has(p.id),
    );
    setGrow((prevGrow) => ({
      ...prevGrow,
      plants: [...prevGrow.plants, ...plantsToConnect],
    }));
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
      setGrow((prevGrow) => ({
        ...prevGrow,
        plants: prevGrow.plants.filter((p) => p.id !== plantId),
      }));
      setAvailablePlants((prevAvailable) => [...prevAvailable, plantToRemove]);
      toast({
        title: "Plant Unassigned",
        description: "Plant has been unassigned from this Grow.",
      });
    }
  };

  // Reset selected plants when filtered plants change
  useEffect(() => {
    setSelectedPlants((prev) => {
      const newSelected = new Set(prev);
      for (const id of newSelected) {
        if (!filteredPlants.some((p) => p.id === id)) {
          newSelected.delete(id);
        }
      }
      return newSelected;
    });
  }, [filteredPlants]);

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // Loading state
  if (isPlantsLoading) {
    return <div>Loading plants...</div>;
  }

  // Error state
  if (isPlantsError) {
    return <div>Error loading plants: {plantsError?.message}</div>;
  }

  return (
    <PageHeader
      title={"Assign Plants to your Grow"}
      subtitle={`Assign or unassign plants to/from ${grow.name}`}
    >
      <FormContent>
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Available Plants (unassigned)</CardTitle>
              <CardDescription>
                Select plants to assign to this Grow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Command className="rounded-sm border shadow-md">
                <CommandInput
                  placeholder="Search plants..."
                  value={searchQuery}
                  onValueChange={handleSearchChange}
                />
                <CommandList>
                  <CommandEmpty>No plants found.</CommandEmpty>
                  <CommandGroup>
                    <AnimatePresence>
                      {filteredPlants.map((plant) => (
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
                            <span>{plant.name}</span>
                            <Badge
                              variant="secondary"
                              className="ml-auto uppercase"
                            >
                              {plant.strain?.name || "No Strain"}
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
                <SquarePlus className="mr-2 h-4 w-4" />
                Assign Selected Plants to Grow
              </Button>
            </CardContent>
          </Card>

          <GrowCard grow={grow} onUnassignPlant={handleRemovePlant} />
        </div>
      </FormContent>
    </PageHeader>
  );
}
