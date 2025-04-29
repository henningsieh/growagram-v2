"use client";

// src/components/features/Images/image-details-card.tsx:
import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { searchParamsToObject } from "~/lib/utils/searchParamsToObject";
import type { GetPhotoByIdType } from "~/server/api/root";
import { useTRPC } from "~/trpc/client";

interface ImageConnectPlantsProps {
  image: GetPhotoByIdType;
  returnParams?: string; // Add returnParams prop
}

export default function ImageConnectPlants({
  image,
  returnParams, // Destructure returnParams (encoded string)
}: ImageConnectPlantsProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const locale = useLocale();

  const t = useTranslations("Photos");

  /**
   * Create back URL href object with preserved parameters using URLSearchParams
   */
  const backHref = React.useMemo(() => {
    const defaultHref = { pathname: modulePaths.PHOTOS.path };
    if (!returnParams) {
      return defaultHref;
    }

    try {
      // Decode the returnParams string
      const decodedParamsString = decodeURIComponent(returnParams);
      // Parse the decoded string using URLSearchParams
      const parsedSearchParams = new URLSearchParams(decodedParamsString);
      // Convert the URLSearchParams object to a plain object
      const query = searchParamsToObject(parsedSearchParams);

      return {
        pathname: modulePaths.PHOTOS.path,
        query: query,
      };
    } catch (e) {
      console.error("Failed to parse return params:", e);
      return defaultHref; // Fallback on error
    }
  }, [returnParams]);

  /**
   * Mutation to connect an image to a plant.
   *
   * On success, invalidates the cache for the image to ensure updated data.
   */
  const connectToPlantMutation = useMutation(
    trpc.photos.connectToPlant.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.photos.getById.queryKey({ id: image.id }),
        });
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
        await queryClient.invalidateQueries({
          queryKey: trpc.photos.getById.queryKey({ id: image.id }),
        });
      },
    }),
  );

  const { data: plantsData, isLoading } = useQuery(
    trpc.plants.getOwnPlants.queryOptions({ limit: 100 }),
  );

  // Move plants array into useMemo to ensure stable references
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

  // Effect to synchronize selectAll state with selectedPlantIds and filteredPlants
  React.useEffect(() => {
    if (filteredPlants.length > 0) {
      setSelectAll(selectedPlantIds.length === filteredPlants.length);
    } else {
      setSelectAll(false); // No plants to select
    }
  }, [selectedPlantIds, filteredPlants]);

  const handleSelectAll = React.useCallback(() => {
    const nextSelectAll = !selectAll; // Determine the next state first
    setSelectAll(nextSelectAll);
    setSelectedPlantIds(
      nextSelectAll ? filteredPlants.map((plant) => plant.id) : [],
    );
  }, [selectAll, filteredPlants, setSelectedPlantIds]); // Added setSelectedPlantIds dependency

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

      // Invalidate photos query instead of using utils
      await queryClient.invalidateQueries({
        queryKey: trpc.photos.getOwnPhotos.queryKey(),
      });

      // Navigate back using the constructed href object
      router.push(backHref);
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
    t,
    router,
    queryClient,
    trpc.photos.getOwnPhotos,
    image.id,
    image.plantImages,
    selectedPlantIds,
    connectToPlantMutation,
    disconnectFromPlantMutation,
    backHref, // Add backHref to dependencies
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
      buttonLink={backHref} // Pass the href object
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
                  checked={selectAll} // Bind checked state directly
                  onCheckedChange={handleSelectAll} // Keep using the handler for click events
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
                        className={`text-muted-foreground cursor-pointer ${
                          selectedPlantIds.includes(plant.id)
                            ? "text-secondary data-[selected=true]:text-secondary font-bold"
                            : "data-[selected=true]:text-foreground"
                        }`}
                      >
                        <div
                          className={`mr-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
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
