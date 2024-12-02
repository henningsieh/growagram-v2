"use client";

// src/components/features/Grows/grow-form.tsx:
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Flower2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import {
  CreateOrEditGrowInput,
  GetOwnGrowType,
  GetOwnPlantsInput,
  GrowConnectPlantInput,
  GrowDisconnectPlantInput,
} from "~/server/api/root";
import { growSchema } from "~/types/zodSchema";

type FormValues = z.infer<typeof growSchema>;

export default function GrowForm({ grow }: { grow?: GetOwnGrowType }) {
  const utils = api.useUtils();
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /**
   * Mutation to connect a plant to an image.
   *
   * On success, invalidates the cache for the image to ensure updated data.
   */
  const connectPlantMutation = api.grow.connectPlant.useMutation({
    onSuccess: async () => {
      // await utils.image.getById.invalidate({ id: image.id });
    },
  });

  /**
   * Mutation to disconnect a plant from an image.
   *
   * On success, invalidates the cache for the image to ensure updated data.
   */
  const disconnectPlantMutation = api.grow.disconnectPlant.useMutation({
    onSuccess: async () => {
      // await utils.image.getById.invalidate({ id: image.id });
    },
  });

  // The prefetched data will be available in the cache
  const initialData = utils.plant.getOwnPlants.getData();
  const { data: plantsData, isLoading } = api.plant.getOwnPlants.useQuery(
    { limit: 100 } satisfies GetOwnPlantsInput,
    {
      // Use the data that was prefetched on the server
      initialData: initialData,
    },
  );
  // Move plants array into useMemo to ensure stable reference
  const plants = useMemo(() => plantsData?.plants || [], [plantsData]);

  // Initialize with connected plants from existing grow
  const initialConnectedPlantIds = useMemo(
    () => grow?.plants?.map((plant) => plant.id) || [],
    [grow?.plants],
  );
  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>(
    initialConnectedPlantIds,
  );

  // Create filtered plants list using useMemo
  const filteredPlants = useMemo(() => {
    if (!plants.length) return [];
    return plants.filter(
      (p) =>
        searchQuery === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [plants, searchQuery]);

  const form = useForm<FormValues>({
    mode: "onBlur",
    resolver: zodResolver(growSchema),
    defaultValues: {
      id: grow?.id,
      name: grow?.name || "",
    },
  });

  const createOrEditGrowMutation = api.grow.createOrEdit.useMutation({
    onSuccess: async (savedGrow) => {
      // Connect/disconnect plants after grow is created/updated
      try {
        // Find plants to connect and disconnect
        const currentPlantIds = grow?.plants?.map((p) => p.id) || [];
        const plantsToConnect = selectedPlantIds.filter(
          (id) => !currentPlantIds.includes(id),
        );
        const plantsToDisconnect = currentPlantIds.filter(
          (id) => !selectedPlantIds.includes(id),
        );

        // Perform connection/disconnection operations
        await Promise.all([
          ...plantsToConnect.map((plantId) =>
            connectPlantMutation.mutateAsync({
              growId: savedGrow.id,
              plantId: plantId,
            } satisfies GrowConnectPlantInput),
          ),
          ...plantsToDisconnect.map((plantId) =>
            disconnectPlantMutation.mutateAsync({
              growId: savedGrow.id,
              plantId: plantId,
            } satisfies GrowDisconnectPlantInput),
          ),
        ]);

        toast({
          title: "Success",
          description: "Your grow has been created and plants updated.",
        });

        // Reset and prefetch the infinite query
        await utils.grow.getOwnGrows.reset();
        await utils.grow.getOwnGrows.prefetchInfinite(
          { limit: 12 }, // match the limit from grows page
        );

        // Navigate to grows page
        router.push("/grows");
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update plants for the grow",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    await createOrEditGrowMutation.mutateAsync(
      values satisfies CreateOrEditGrowInput,
    );
  }

  const togglePlantSelection = (plantId: string) => {
    setSelectedPlantIds((prev) =>
      prev.includes(plantId)
        ? prev.filter((id) => id !== plantId)
        : [...prev, plantId],
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle level="h2">Grow Setup</CardTitle>
        <CardDescription>
          Create and name your new grow environment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Grow Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter grow name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Give your grow a descriptive name, like &quot;Summer Indoor
                    Grow&quot; or &quot;Backyard Greenhouse&quot;.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="mb-2 block font-semibold">
                Select Plants for this Grow
              </FormLabel>
              <Command
                className="rounded-sm border shadow-md"
                shouldFilter={false}
              >
                <CommandInput
                  placeholder="Search plants..."
                  value={searchQuery}
                  onValueChange={(value) => {
                    console.debug("value:", value);
                    setSearchQuery(value);
                  }}
                />
                {isLoading ? (
                  <div className="flex justify-center p-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
                  </div>
                ) : (
                  <CommandList className="min-h-24">
                    <CommandEmpty>No plants found</CommandEmpty>
                    <CommandGroup>
                      {filteredPlants.map((plant) => (
                        <CommandItem
                          key={plant.id}
                          onSelect={() => togglePlantSelection(plant.id)}
                          className={`cursor-pointer ${
                            selectedPlantIds.includes(plant.id)
                              ? "font-bold text-secondary"
                              : ""
                          }`}
                        >
                          <div
                            className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
                              selectedPlantIds.includes(plant.id)
                                ? "border-secondary bg-secondary"
                                : "border-secondary"
                            }`}
                          >
                            {selectedPlantIds.includes(plant.id) && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                          <Flower2 className="mr-2 h-4 w-4" />
                          <span>{plant.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                )}
              </Command>
              <FormDescription className="mt-2">
                {selectedPlantIds.length > 0
                  ? `${selectedPlantIds.length} plant(s) selected`
                  : "Optional: Select plants for this grow"}
              </FormDescription>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                title="Reset"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setSelectedPlantIds([]);
                  setSearchQuery("");
                }}
                className="w-full"
              >
                Reset
              </Button>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : grow?.id
                    ? "Save Changes"
                    : "Create Grow"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
