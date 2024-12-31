"use client";

// src/components/features/Images/image-details-card.tsx:
import { TRPCClientError } from "@trpc/client";
import { Check, Flower2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
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
import { Checkbox } from "~/components/ui/checkbox";
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
import { GetOwnPlantsInput, GetPhotoByIdType } from "~/server/api/root";

import { ImageDetailsCard } from "./image-details-card";

interface ImageConnectPlantsProps {
  image: GetPhotoByIdType;
}

export default function ImageConnectPlants({ image }: ImageConnectPlantsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const locale = useLocale();
  const utils = api.useUtils();

  const t = useTranslations("Images");

  const allPhotosQuery = useSearchParams();

  /**
   * Mutation to connect an image to a plant.
   *
   * On success, invalidates the cache for the image to ensure updated data.
   */
  const connectToPlantMutation = api.photos.connectToPlant.useMutation({
    onSuccess: async () => {
      await utils.photos.getById.invalidate({ id: image.id });
    },
  });

  /**
   * Mutation to disconnect an image from a plant.
   *
   * On success, invalidates the cache for the image to ensure updated data.
   */
  const disconnectFromPlantMutation =
    api.photos.disconnectFromPlant.useMutation({
      onSuccess: async () => {
        await utils.photos.getById.invalidate({ id: image.id });
      },
    });

  // The prefetched data will be available in the cache
  const initialData = utils.plants.getOwnPlants.getData();

  const { data: plantsData, isLoading } = api.plants.getOwnPlants.useQuery(
    { limit: 100 } satisfies GetOwnPlantsInput,
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

  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = useCallback(() => {
    setSelectAll(!selectAll);
    setSelectedPlantIds(
      selectAll ? [] : filteredPlants.map((plant) => plant.id),
    );
  }, [selectAll, filteredPlants]);

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
          connectToPlantMutation.mutateAsync({
            imageId: image.id,
            plantId: plantId,
          }),
        ),
        ...plantsToDisconnect.map((plantId) =>
          disconnectFromPlantMutation.mutateAsync({
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
      await utils.photos.getOwnPhotos.invalidate();
      router.push("/photos");
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
    connectToPlantMutation,
    disconnectFromPlantMutation,
    toast,
    router,
    utils.photos.getOwnPhotos,
  ]);

  const togglePlantSelection = useCallback((plantId: string) => {
    setSelectedPlantIds((prev) =>
      prev.includes(plantId)
        ? prev.filter((id) => id !== plantId)
        : [...prev, plantId],
    );
  }, []);

  return (
    <PageHeader
      title={t("title")}
      subtitle={t("subtitle")}
      buttonLabel={t("buttonBackLabel")}
      buttonLink="/photos"
      searchParams={allPhotosQuery}
    >
      <FormContent>
        <Card>
          <CardHeader className="p-3 pb-0 md:p-7 md:pb-0">
            <CardTitle as="h2">{t("plantSelection.title")}</CardTitle>
            <CardDescription>{t("plantSelection.description")}</CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <Command
              className="rounded-sm border shadow-md"
              shouldFilter={false}
            >
              <div className="flex w-full items-center border-b pl-1">
                <Checkbox
                  className="m-2 border-secondary data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground"
                  onCheckedChange={handleSelectAll}
                />
                <CommandInput
                  placeholder={t("search.placeholder")}
                  value={searchQuery}
                  onValueChange={(value) => {
                    console.debug("value:", value);
                    setSearchQuery(value);
                  }}
                />
              </div>
              {isLoading ? (
                <SpinningLoader />
              ) : (
                <CommandList className="min-h-24">
                  <CommandEmpty>{t("search.noResults")}</CommandEmpty>
                  <CommandGroup className="max-h-32 overflow-y-scroll md:max-h-44">
                    {filteredPlants.map((plant) => (
                      <CommandItem
                        key={plant.id}
                        onSelect={() => togglePlantSelection(plant.id)}
                        className={`data[] cursor-pointer data-[selected=true]:font-bold ${
                          selectedPlantIds.includes(plant.id)
                            ? "font-bold text-secondary data-[selected=true]:text-secondary"
                            : "data-[selected=true]:text-foreground"
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
                        {plant.strain?.name && (
                          <Badge
                            variant="outline"
                            className="ml-auto bg-seedling uppercase text-white"
                          >
                            {plant.strain?.name}
                          </Badge>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              )}
            </Command>
            <div className="pt-2">
              <Button
                variant={"secondary"}
                onClick={handleConnectPlants}
                disabled={connectToPlantMutation.isPending}
                className="w-full"
              >
                {connectToPlantMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {t("button.connecting")}
                  </div>
                ) : selectedPlantIds.length === 0 ? (
                  t("button.removeAll")
                ) : (
                  t("button.save", { count: selectedPlantIds.length })
                )}
              </Button>
            </div>
          </CardContent>
          <hr className="my-4" />
          <CardContent className="p-2 md:p-6">
            <ImageDetailsCard image={image} locale={locale} />
          </CardContent>
        </Card>
      </FormContent>
    </PageHeader>
  );
}
