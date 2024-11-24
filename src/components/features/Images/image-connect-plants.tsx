"use client";

import { TRPCClientError } from "@trpc/client";
import { Camera, Check, FileIcon, Flower2, UploadCloud } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
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
import { formatDate, formatTime } from "~/lib/utils";
import { ImageWithPlantsById } from "~/server/api/root";

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
  const initialData = utils.plant.getOwnPlants.getData(); //as GetOwnPlantsOutput;

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
    toast,
    router,
    connectPlantMutation,
    disconnectPlantMutation,
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
            <CardTitle>Plant Selection</CardTitle>
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

                  setSearchQuery(value);
                }}
              />
              <CommandList className="min-h-24">
                {!initialData || isLoading || !plantsData ? (
                  <SpinningLoader />
                ) : (
                  <>
                    <CommandEmpty>No plants found.</CommandEmpty>
                    <CommandGroup>
                      {filteredPlants.map((plant) => (
                        <CommandItem
                          key={plant.id}
                          onSelect={() => togglePlantSelection(plant.id)}
                          className="cursor-pointer text-accent-foreground data-[selected=true]:text-foreground"
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
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
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
            <div className="flex flex-col gap-2 md:flex-row">
              <Card className="w-full rounded-sm bg-muted shadow-md hover:shadow-none md:w-3/5">
                <CardHeader className="p-2 lg:p-8">
                  <CardTitle className="m-0">
                    <div className="text-2xl font-semibold">Image Details</div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-2 lg:p-6">
                  <div className="flex justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="whitespace-nowrap text-sm font-medium">
                        Original Filename:
                      </span>
                    </div>

                    <div className="flex overflow-hidden">
                      <span className="break-all text-xs text-muted-foreground">
                        {image.originalFilename}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <Camera className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="whitespace-nowrap text-sm font-medium">
                        Capture Date:
                      </span>
                    </div>
                    <div className="flex w-full items-center justify-end space-x-1">
                      <span className="text-right text-sm text-muted-foreground">
                        {formatDate(image.captureDate, locale)}
                        <span className="hidden sm:inline-block">
                          {locale !== "en" ? " um " : " at "}
                          {formatTime(image.captureDate, locale)}
                          {locale !== "en" && " Uhr"}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <UploadCloud className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="whitespace-nowrap text-sm font-medium">
                        Upload Date:
                      </span>
                    </div>
                    <div className="flex w-full items-center justify-end space-x-1">
                      <span className="text-right text-sm text-muted-foreground">
                        {formatDate(image.createdAt, locale)}
                        <span className="hidden sm:inline-block">
                          {locale !== "en" ? " um " : " at "}
                          {formatTime(image.createdAt, locale)}
                          {locale !== "en" && " Uhr"}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* <div className="mt-4 flex flex-col gap-2">
                      <div>
                        <Badge variant="outline">Image-ID: {image.id}</Badge>
                      </div>

                      <div>
                        <Badge variant="outline">
                          Owner-ID: {image.ownerId.slice(0, 16)}...
                        </Badge>
                      </div>
                    </div> */}
                </CardContent>
              </Card>
              <div className="relative aspect-square w-full shrink-0 md:w-2/5">
                <Image
                  priority
                  alt="Plant image"
                  src={image.imageUrl}
                  fill
                  sizes="(max-width: 767px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </FormContent>
    </PageHeader>
  );
}
