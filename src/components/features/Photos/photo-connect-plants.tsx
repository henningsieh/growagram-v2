"use client";

// src/components/features/Images/image-details-card.tsx:
import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { Check, Flower2Icon } from "lucide-react";
import { toast } from "sonner";
import { modulePaths } from "~/assets/constants";
import FormContent from "~/components/Layouts/form-content";
import PageHeader from "~/components/Layouts/page-header";
import SpinningLoader from "~/components/atom/spinning-loader";
import { ImageDetailsCard } from "~/components/features/Photos/image-details-card";
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
import { useRouter } from "~/lib/i18n/routing";
import { useTRPC } from "~/lib/trpc/client";
import type { GetOwnPlantsInput, GetPhotoByIdType } from "~/server/api/root";

interface PhotoConnectPlantsProps {
  image: GetPhotoByIdType;
}

export default function PhotoConnectPlants({ image }: PhotoConnectPlantsProps) {
  const trpc = useTRPC();
  const router = useRouter();
  const locale = useLocale();
  const queryClient = useQueryClient();

  const t = useTranslations("Photos");

  const allPhotosQuery = useSearchParams();

  /**
   * Mutation to connect an image to a plant.
   *
   * On success, invalidates the cache for the image to ensure updated data.
   */
  const connectToPlantMutation = useMutation(
    trpc.photos.connectToPlant.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.photos.getById.queryFilter({ id: image.id }),
        );
      },
    }),
  );

  /**
   * Mutation to disconnect an image from a plant.
   *
   * On success, invalidates the cache for the image to ensure updated data.
   */
  const disconnectFromPlantMutation = useMutation(
    trpc.photos.disconnectFromPlant.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.photos.getById.queryFilter({ id: image.id }),
        );
      },
    }),
  );

  // The prefetched data will be available in the cache
  const initialData = queryClient.getQueryData(
    trpc.plants.getOwnPlants.queryKey(),
  );

  const { data: plantsData, isLoading } = useQuery(
    trpc.plants.getOwnPlants.queryOptions(
      { limit: 100 } satisfies GetOwnPlantsInput,
      {
        // Use the data that was prefetched on the server
        initialData: initialData,
      },
    ),
  );

  // Move plants array into useMemo to ensure stable reference
  const plants = React.useMemo(() => plantsData?.plants || [], [plantsData]);

  // Initialize with connected plants
  const initialSelectedPlantIds = React.useMemo(
    () => image.plantImages.map((plantImage) => plantImage.plant.id),
    [image.plantImages],
  );

  const [selectedPlantIds, setSelectedPlantIds] = React.useState<string[]>(
    initialSelectedPlantIds,
  );
  const [searchQuery, setSearchQuery] = React.useState("");

  // Create filtered plants list using useMemo
  const filteredPlants = React.useMemo(() => {
    if (!plants.length) return [];
    return plants.filter(
      (p) =>
        searchQuery === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [plants, searchQuery]);

  const [selectAll, setSelectAll] = React.useState(false);

  const handleSelectAll = React.useCallback(() => {
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
  const handleConnectPlants = React.useCallback(async () => {
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
      toast(t("toasts.success.connectPlants.title"), {
        description: t("toasts.success.connectPlants.description"),
      });
      await queryClient.invalidateQueries(
        trpc.photos.getOwnPhotos.pathFilter(),
      );
      router.push(modulePaths.PHOTOS.path);
    } catch (error) {
      // Show error toast when any operation fails
      toast.error(t("toasts.errors.connectPlants.title"), {
        description:
          error instanceof TRPCClientError
            ? error.message
            : t("toasts.errors.connectPlants.description"),
      });
    }
  }, [
    image.id,
    image.plantImages,
    selectedPlantIds,
    t,
    queryClient,
    trpc.photos.getOwnPhotos,
    router,
    connectToPlantMutation,
    disconnectFromPlantMutation,
  ]);

  const togglePlantSelection = React.useCallback((plantId: string) => {
    setSelectedPlantIds((prev) =>
      prev.includes(plantId)
        ? prev.filter((id) => id !== plantId)
        : [...prev, plantId],
    );
  }, []);

  // Check if the current selection differs from the initial selection
  const selectionChanged = React.useMemo(() => {
    if (selectedPlantIds.length !== initialSelectedPlantIds.length) return true;

    const initialSet = new Set(initialSelectedPlantIds);
    return selectedPlantIds.some((id) => !initialSet.has(id));
  }, [selectedPlantIds, initialSelectedPlantIds]);

  return (
    <PageHeader
      title={t("connect-plants-title")}
      subtitle={t("connect-plants-subtitle")}
      buttonLabel={t("buttonBackLabel")}
      buttonLink={modulePaths.PHOTOS.path}
      searchParams={allPhotosQuery ?? undefined}
    >
      <FormContent>
        <Card className="rounded-md py-2">
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
                  className="border-secondary data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground m-2"
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
                        className={`data[] hover:text-accent-foreground cursor-pointer ${
                          selectedPlantIds.includes(plant.id)
                            ? "text-secondary font-bold"
                            : "data-[selected=true]:text-accent-foreground"
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
                            <Check className="text-primary-foreground h-3 w-3" />
                          )}
                        </div>
                        <Flower2Icon className="mr-2 h-4 w-4" />
                        <span>{plant.name}</span>
                        {plant.strain?.name && (
                          <Badge
                            variant="outline"
                            className="bg-seedling ml-auto text-white uppercase"
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
                disabled={!selectionChanged || connectToPlantMutation.isPending}
                className="w-full"
              >
                {connectToPlantMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {t("button.connecting")}
                  </div>
                ) : selectedPlantIds.length === 0 && selectionChanged ? (
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
