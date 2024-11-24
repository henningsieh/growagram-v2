"use client";

// src/components/features/Images/image-details-card.tsx:
import { TRPCClientError } from "@trpc/client";
import { Check, Flower2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import FormContent from "~/components/Layouts/form-content";
import SpinningLoader from "~/components/Layouts/loader";
import PageHeader from "~/components/Layouts/page-header";
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
import { useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import { ImageWithPlantsById } from "~/server/api/root";

import { ImageDetailsCard } from "./image-details-card";

interface ImageConnectPlantsProps {
  image: ImageWithPlantsById;
}

export default function ImageConnectPlants({ image }: ImageConnectPlantsProps) {
  const { toast } = useToast();
  const router = useRouter();
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

  const { data: plantsData, isLoading } = api.plant.getOwnPlants.useQuery(
    undefined,
    {
      // Use the data that was prefetched on the server
      initialData: initialData,
    },
  );

  // Move plants array into useMemo to ensure stable reference
  const plants = useMemo(() => plantsData?.plants || [], [plantsData]);

  // Initialize with connected plants
  const initialSelectedPlantIds = useMemo(
    () => image.plantImages.map((plantImage) => plantImage.plant.id),
    [image.plantImages],
  );

  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>(
    initialSelectedPlantIds,
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Create filtered plants list using useMemo
  const filteredPlants = useMemo(() => {
    if (!plants.length) return [];
    return plants.filter(
      (p) =>
        searchQuery === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [plants, searchQuery]);

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
      await utils.image.getOwnImages.invalidate();
      router.push("/images");
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
    connectPlantMutation,
    disconnectPlantMutation,
    toast,
    router,
    utils.image.getOwnImages,
  ]);

  const togglePlantSelection = useCallback((plantId: string) => {
    setSelectedPlantIds((prev) =>
      prev.includes(plantId)
        ? prev.filter((id) => id !== plantId)
        : [...prev, plantId],
    );
  }, []);

  useEffect(() => {
    console.debug("searchQuery:", searchQuery);
  }, [searchQuery]);

  // useTranslations() MUST NOT to be async
  const t = useTranslations("Platform");

  return (
    <PageHeader
      title="Identify Plants"
      subtitle="Which plants did you spot in this photo?"
      buttonLabel="Back"
      buttonLink="/images"
    >
      <FormContent>
        <Card>
          <CardHeader>
            <CardTitle level="h2">Plant Selection</CardTitle>
            <CardDescription>
              Select each plant you can see in the photo
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <Command className="rounded-lg border shadow-md">
              <CommandInput
                placeholder="Search plants..."
                value={searchQuery}
                onValueChange={(value) => {
                  console.debug("value:", value);

                  setSearchQuery("");

                  setSearchQuery(value);
                }}
              />
              {isLoading ? (
                <SpinningLoader />
              ) : (
                <CommandList className="min-h-24">
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {!!!filteredPlants.length ? (
                      // <CommandItem disabled>No plants found.</CommandItem>
                      <CommandEmpty>No results found.</CommandEmpty>
                    ) : (
                      filteredPlants.map((plant) => (
                        <CommandItem
                          key={plant.id}
                          onSelect={() => togglePlantSelection(plant.id)}
                          className="cursor-pointer text-foreground data-[selected=true]:text-foreground"
                        >
                          <div
                            className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
                              selectedPlantIds.includes(plant.id)
                                ? "border-primary bg-primary"
                                : "border-primary"
                            }`}
                          >
                            {selectedPlantIds.includes(plant.id) && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                          <Flower2 className="mr-2 h-4 w-4" />
                          <span>{plant.name}</span>
                          {plant.strain?.name && (
                            <Badge
                              variant="secondary"
                              className="ml-auto uppercase"
                            >
                              {plant.strain?.name}
                            </Badge>
                          )}
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                </CommandList>
              )}
            </Command>
            <Button
              onClick={handleConnectPlants}
              disabled={connectPlantMutation.isPending}
              className="mt-4 w-full"
            >
              {connectPlantMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Connecting plants...
                </div>
              ) : selectedPlantIds.length === 0 ? (
                "Remove All Plants"
              ) : (
                `Save Plant Selection (${selectedPlantIds.length})`
              )}
            </Button>
          </CardContent>
          <hr />
          <CardContent className="p-2 md:p-6">
            {/* <div className="container mx-auto p-0"> */}
            <ImageDetailsCard image={image} locale={locale} />
            {/* </div> */}
          </CardContent>
        </Card>
      </FormContent>
    </PageHeader>
  );
}
