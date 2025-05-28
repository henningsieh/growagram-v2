"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import {
  ArrowRight,
  Check,
  CircleAlertIcon,
  ImageIcon,
  TagIcon,
  TentTree,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PaginationItemsPerPage, modulePaths } from "~/assets/constants";
import FormContent from "~/components/Layouts/form-content";
import PageHeader from "~/components/Layouts/page-header";
import { RESPONSIVE_IMAGE_SIZES } from "~/components/Layouts/responsive-grid";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import SpinningLoader from "~/components/atom/spinning-loader";
import { Alert } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Link, useRouter } from "~/lib/i18n/routing";
import { useTRPC } from "~/lib/trpc/client";
import { uploadToS3 } from "~/lib/utils/uploadToS3";
import type {
  CreateOrEditGrowInput,
  GetConnectablePlantsInput,
  GetGrowByIdType,
  GetOwnGrowsInput,
  GrowConnectPlantInput,
  GrowDisconnectPlantInput,
} from "~/server/api/root";
import {
  CultureMedium,
  FertilizerForm,
  FertilizerType,
  GrowEnvironment,
  GrowsSortField,
} from "~/types/grow";
import { growFormSchema } from "~/types/zodSchema";

type FormValues = z.infer<typeof growFormSchema>;

export function GrowForm({ grow }: { grow?: GetGrowByIdType }) {
  const trpc = useTRPC();
  const t_nav = useTranslations("Navigation");
  const t = useTranslations("Grows");

  // Determine the mode based on the presence of grow
  const isEditMode = !!grow;

  // Dynamic texts based on mode
  const pageTexts = {
    formTitle: isEditMode
      ? t("form-title-edit-grow")
      : t("form-title-create-new-grow"),
    formDescription: isEditMode
      ? t("form-description-edit-grow")
      : t("form-description-create-new-grow"),
    submitButtonText: isEditMode
      ? t("button-label-save-changes")
      : t("button-label-create-grow"),
    successToast: {
      title: t("success-title"),
      description: isEditMode
        ? t("success-description-edit")
        : t("success-description-create"),
    },
  };

  const queryClient = useQueryClient();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  /**
   * Handle TRPC errors and display appropriate toast messages
   */
  const handleTRPCError = (error: unknown) => {
    if (error instanceof TRPCClientError) {
      const errorMessage = error.message || t("error-default");
      toast.error(t("error-title"), {
        description: errorMessage,
      });
    } else {
      toast.error(t("error-title"), {
        description: t("unexpected-error"),
      });
    }
  };

  /**
   * Mutation to connect a plant to a grow environment.
   */
  const connectPlantMutation = useMutation(
    trpc.grows.connectPlant.mutationOptions({
      onSuccess: async () => {
        // Invalidate and refetch relevant queries
        await queryClient.invalidateQueries(
          trpc.grows.getOwnGrows.pathFilter(),
        );
        await queryClient.invalidateQueries(
          trpc.plants.getOwnPlants.pathFilter(),
        );

        toast(t("toasts.connect-success.title"), {
          description: t("toasts.connect-success.description"),
        });
      },
      onError: (error) => {
        toast.error(t("error-title"), {
          description: t("connect-error"),
        });
        handleTRPCError(error);
      },
    }),
  );

  /**
   * Mutation to disconnect a plant from a grow environment.
   */
  const disconnectPlantMutation = useMutation(
    trpc.grows.disconnectPlant.mutationOptions({
      onSuccess: async () => {
        // Invalidate and refetch relevant queries
        await queryClient.invalidateQueries(
          trpc.grows.getOwnGrows.pathFilter(),
        );
        await queryClient.invalidateQueries(
          trpc.plants.getOwnPlants.pathFilter(),
        );

        toast(t("toasts.disconnect-success.title"), {
          description: t("toasts.disconnect-success.description"),
        });
      },
      onError: (error) => {
        toast.error(t("error-title"), {
          description: t("disconnect-error"),
        });
        handleTRPCError(error);
      },
    }),
  );

  // fetching connectable plants from utils cache
  const initialData = queryClient.getQueryData(
    trpc.plants.getConnectablePlants.queryKey({
      growId: grow?.id,
    } satisfies GetConnectablePlantsInput),
  );

  // Data fetching and form initialization...
  const { data: plantsData, isPending } = useQuery(
    trpc.plants.getConnectablePlants.queryOptions(
      { growId: grow?.id } satisfies GetConnectablePlantsInput,
      {
        initialData: initialData,
      },
    ),
  );
  const plants = React.useMemo(() => plantsData?.plants || [], [plantsData]);

  const initialConnectedPlantIds = React.useMemo(
    () => grow?.plants?.map((plant) => plant.id) || [],
    [grow?.plants],
  );
  const [selectedPlantIds, setSelectedPlantIds] = React.useState<string[]>(
    initialConnectedPlantIds,
  );

  // State for header image management
  const [headerImageUrl, setHeaderImageUrl] = React.useState<string | null>(
    grow?.headerImage?.imageUrl || null,
  );
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Create a photo mutation - defined at component level
  const createPhotoMutation = useMutation(
    trpc.photos.createPhoto.mutationOptions(),
  );

  // Header image update mutation
  const updateHeaderImageMutation = useMutation(
    trpc.grows.updateHeaderImage.mutationOptions({
      onSuccess: async () => {
        toast(t("header-image-update-success-title"), {
          description: t("header-image-update-success-description"),
        });
        await queryClient.invalidateQueries(
          trpc.grows.getOwnGrows.pathFilter(),
        );
        if (grow?.id) {
          await queryClient.invalidateQueries(
            trpc.grows.getById.queryFilter({ id: grow.id }),
          );
        }
      },
      onError: (error) => {
        toast.error(t("header-image-update-error-title"), {
          description:
            error.message || t("header-image-update-error-description"),
        });
      },
    }),
  );

  const filteredPlants = React.useMemo(() => {
    if (!plants.length) return [];
    return plants.filter(
      (p) =>
        searchQuery === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [plants, searchQuery]);

  const form = useForm<FormValues>({
    mode: "onBlur",
    resolver: zodResolver(growFormSchema),
    defaultValues: {
      id: grow?.id,
      name: grow?.name || "",
      environment: grow?.environment || undefined,
      cultureMedium: grow?.cultureMedium || undefined,
      fertilizerType: grow?.fertilizerType || undefined,
      fertilizerForm: grow?.fertilizerForm || undefined,
    },
  });

  /**
   * Mutation to create or edit a grow environment.
   */
  const createOrEditGrowMutation = useMutation(
    trpc.grows.createOrEdit.mutationOptions({
      onSuccess: async (savedGrow) => {
        try {
          // Find plants to connect and disconnect
          const currentPlantIds = grow?.plants?.map((p) => p.id) || [];
          const plantsToConnect = selectedPlantIds.filter(
            (id) => !currentPlantIds.includes(id),
          );
          const plantsToDisconnect = currentPlantIds.filter(
            (id) => !selectedPlantIds.includes(id),
          );

          // Perform connection/disconnection operations with error tracking
          const connectResults = await Promise.allSettled(
            plantsToConnect.map((plantId) =>
              connectPlantMutation.mutateAsync({
                growId: savedGrow.id,
                plantId: plantId,
              } satisfies GrowConnectPlantInput),
            ),
          );

          const disconnectResults = await Promise.allSettled(
            plantsToDisconnect.map((plantId) =>
              disconnectPlantMutation.mutateAsync({
                growId: savedGrow.id,
                plantId: plantId,
              } satisfies GrowDisconnectPlantInput),
            ),
          );

          // Check for any connection/disconnection errors
          const connectionErrors = connectResults
            .filter(
              (result): result is PromiseRejectedResult =>
                result.status === "rejected",
            )
            .map((result) => result.reason as Error);

          const disconnectionErrors = disconnectResults
            .filter(
              (result): result is PromiseRejectedResult =>
                result.status === "rejected",
            )
            .map((result) => result.reason as Error);

          if (connectionErrors.length > 0 || disconnectionErrors.length > 0) {
            const errorMessages = [
              ...connectionErrors.map((err) => `${t("connect-error")}: ${err}`),
              ...disconnectionErrors.map(
                (err) => `${t("disconnect-error")}: ${err}`,
              ),
            ];

            throw new Error(errorMessages.join("; "));
          }

          toast(pageTexts.successToast.title, {
            description: pageTexts.successToast.description,
          });

          const queryObject = {
            cursor: 1,
            limit: PaginationItemsPerPage.GROWS_PER_PAGE,
            sortField: GrowsSortField.NAME,
            sortOrder: SortOrder.ASC,
          } satisfies GetOwnGrowsInput;

          // Reset and prefetch queries
          await Promise.all([
            queryClient.resetQueries(trpc.grows.getOwnGrows.pathFilter()),
            queryClient.prefetchInfiniteQuery(
              trpc.grows.getOwnGrows.infiniteQueryOptions(queryObject),
            ),
            queryClient.prefetchQuery(
              trpc.grows.getOwnGrows.queryOptions(queryObject),
            ),
          ]);

          // Navigate to grows page
          router.push(modulePaths.GROWS.path);
        } catch (error) {
          toast.error(t("error-title"), {
            description: t("error-default"),
          });
          handleTRPCError(error);
        } finally {
          setIsSubmitting(false);
        }
      },
      onError: (error) => {
        toast.error(t("error-title"), {
          description: t("error-default"),
        });
        handleTRPCError(error);
        setIsSubmitting(false);
      },
    }),
  );

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);

    try {
      await createOrEditGrowMutation.mutateAsync(
        values satisfies CreateOrEditGrowInput,
      );
    } catch (error) {
      // Catch any unexpected errors during submission
      toast.error(t("error-title"), {
        description: t("error-default"),
      });
      handleTRPCError(error);
      setIsSubmitting(false);
    }
  }

  const togglePlantSelection = (plantId: string) => {
    setSelectedPlantIds((prev) =>
      prev.includes(plantId)
        ? prev.filter((id) => id !== plantId)
        : [...prev, plantId],
    );
  };

  return (
    <PageHeader
      title={
        grow === undefined
          ? t("form-page-title-new")
          : t("form-page-title-edit")
      }
      subtitle={
        grow === undefined
          ? t("form-page-subtitle-new")
          : t("form-page-subtitle-edit")
      }
      buttonLabel={t("button-label-back")}
      buttonVariant={"outline"}
      buttonLink={modulePaths.GROWS.path}
    >
      <FormContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Form {...form}>
            <Card>
              <CardHeader className="p-2 pb-0 sm:p-3 sm:pb-0 lg:p-4 lg:pb-0 xl:p-6 xl:pb-0">
                <CardTitle as="h2">{pageTexts.formTitle}</CardTitle>
                <CardDescription>{pageTexts.formDescription}</CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-3 lg:p-4 xl:p-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          {t("grow-name")}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <TentTree className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                            <Input
                              className="pl-10"
                              placeholder={t("grow-name-placeholder")}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          {t("grow-name-description")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Header Image Section */}
                  <div className="space-y-2">
                    <FormLabel className="font-semibold">
                      {t("grow-header-image")}
                    </FormLabel>

                    <div className="flex flex-col gap-4">
                      {/* Display current header image if exists */}
                      {headerImageUrl && (
                        <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-md border">
                          <Image
                            fill
                            sizes={RESPONSIVE_IMAGE_SIZES}
                            src={headerImageUrl}
                            alt={t("grow-header-image")}
                            className="h-full w-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full"
                            onClick={() => {
                              if (grow?.id) {
                                updateHeaderImageMutation.mutate({
                                  growId: grow.id,
                                  headerImageId: null,
                                });
                                setHeaderImageUrl(null);
                              }
                            }}
                            disabled={
                              updateHeaderImageMutation.isPending ||
                              isSubmitting
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {/* File selection input */}
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSelectedFile(file);
                              // Create a preview URL
                              const objectUrl = URL.createObjectURL(file);
                              setHeaderImageUrl(objectUrl);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={
                            isUploadingImage ||
                            isSubmitting ||
                            updateHeaderImageMutation.isPending
                          }
                          className="flex gap-2"
                        >
                          <ImageIcon className="h-4 w-4" />
                          {selectedFile ? t("change-image") : t("select-image")}
                        </Button>
                        {selectedFile && grow?.id && (
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={async () => {
                              if (!selectedFile || !grow?.id) return;

                              setIsUploadingImage(true);
                              try {
                                // Get a signed URL from the API
                                const fileName = `${grow.id}-${Date.now()}-${selectedFile.name}`;
                                const response = await fetch(
                                  "/api/getSignedURL",
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      fileName,
                                      fileType: selectedFile.type,
                                    }),
                                  },
                                );

                                if (!response.ok) {
                                  throw new Error("Failed to get upload URL");
                                }

                                const { uploadUrl } =
                                  (await response.json()) as {
                                    uploadUrl: string;
                                  };

                                // Upload file to S3
                                const { url: imageUrl, eTag } =
                                  await uploadToS3(selectedFile, uploadUrl);

                                // Create image record - use the mutation defined at component level
                                const [newImage] =
                                  await createPhotoMutation.mutateAsync({
                                    // Let the server generate the ID
                                    imageUrl,
                                    s3Key: `photos/${fileName}`,
                                    s3ETag: eTag,
                                    originalFilename: selectedFile.name,
                                    captureDate: new Date(),
                                  });

                                // Update grow header image
                                await updateHeaderImageMutation.mutateAsync({
                                  growId: grow.id,
                                  headerImageId: newImage.id,
                                });

                                setSelectedFile(null);
                                toast.success(t("image-upload-success"));
                              } catch (error) {
                                console.error("Upload error:", error);
                                toast.error(t("image-upload-error-title"), {
                                  description: t(
                                    "image-upload-error-description",
                                  ),
                                });
                              } finally {
                                setIsUploadingImage(false);
                              }
                            }}
                            disabled={
                              isUploadingImage ||
                              isSubmitting ||
                              updateHeaderImageMutation.isPending
                            }
                          >
                            {isUploadingImage ? (
                              <>
                                <SpinningLoader className="mr-2 h-4 w-4" />{" "}
                                {t("uploading")}
                              </>
                            ) : (
                              t("upload-image")
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    <FormDescription>
                      {t("header-image-description")}
                    </FormDescription>
                  </div>

                  {/* Environment Field */}
                  <FormField
                    control={form.control}
                    name="environment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          {t("environment-label")}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("environment-placeholder")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={GrowEnvironment.INDOOR}>
                              {t("environment-indoor")}
                            </SelectItem>
                            <SelectItem value={GrowEnvironment.OUTDOOR}>
                              {t("environment-outdoor")}
                            </SelectItem>
                            <SelectItem value={GrowEnvironment.GREENHOUSE}>
                              {t("environment-greenhouse")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {t("environment-description")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Culture Medium Field */}
                  <FormField
                    control={form.control}
                    name="cultureMedium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          {t("culture-medium-label")}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("culture-medium-placeholder")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={CultureMedium.SOIL}>
                              {t("culture-medium-soil")}
                            </SelectItem>
                            <SelectItem value={CultureMedium.COCO}>
                              {t("culture-medium-coco")}
                            </SelectItem>
                            <SelectItem value={CultureMedium.HYDRO}>
                              {t("culture-medium-hydro")}
                            </SelectItem>
                            <SelectItem value={CultureMedium.ROCKWOOL}>
                              {t("culture-medium-rockwool")}
                            </SelectItem>
                            <SelectItem value={CultureMedium.PERLITE}>
                              {t("culture-medium-perlite")}
                            </SelectItem>
                            <SelectItem value={CultureMedium.VERMICULITE}>
                              {t("culture-medium-vermiculite")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {t("culture-medium-description")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Fertilizer Type Field */}
                  <FormField
                    control={form.control}
                    name="fertilizerType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          {t("fertilizer-type-label")}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("fertilizer-type-placeholder")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={FertilizerType.ORGANIC}>
                              {t("fertilizer-type-organic")}
                            </SelectItem>
                            <SelectItem value={FertilizerType.MINERAL}>
                              {t("fertilizer-type-mineral")}
                            </SelectItem>
                            {/* <SelectItem value={FertilizerType.LIQUID}>
                              {t("fertilizer-type-liquid")}
                            </SelectItem>
                            <SelectItem value={FertilizerType.GRANULAR}>
                              {t("fertilizer-type-granular")}
                            </SelectItem>
                            <SelectItem value={FertilizerType.SLOW_RELEASE}>
                              {t("fertilizer-type-slow-release")}
                            </SelectItem> */}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {t("fertilizer-type-description")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Fertilizer Form Field */}
                  <FormField
                    control={form.control}
                    name="fertilizerForm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          {t("fertilizer-form-label")}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("fertilizer-form-placeholder")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={FertilizerForm.LIQUID}>
                              {t("fertilizer-form-liquid")}
                            </SelectItem>
                            <SelectItem value={FertilizerForm.GRANULAR}>
                              {t("fertilizer-form-granular")}
                            </SelectItem>
                            <SelectItem value={FertilizerForm.SLOW_RELEASE}>
                              {t("fertilizer-form-slow_release")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {t("fertilizer-form-description")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel className="mb-2 block font-semibold">
                      {t("select-plants")}
                    </FormLabel>

                    <Command
                      className="rounded-sm border shadow-md"
                      shouldFilter={false}
                    >
                      <CommandInput
                        placeholder={t("search-plants")}
                        value={searchQuery}
                        onValueChange={(value) => setSearchQuery(value)}
                      />
                      {isPending ? (
                        <SpinningLoader className="m-4 size-12" />
                      ) : (
                        <CommandList className="min-h-24">
                          <CommandEmpty className="mx-auto my-4 w-full space-y-2 p-4">
                            <Alert variant="destructive">
                              <CircleAlertIcon className="size-5" />
                              {t("no-plants-connectable")}
                            </Alert>
                            <div className="flex justify-end">
                              <Button className="p-0" variant="link" asChild>
                                <Link
                                  className="roundex-xs h-6 text-sm"
                                  href={modulePaths.PLANTS.path}
                                >
                                  {t_nav("my-plants")}
                                  <ArrowRight className="ml-1 h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </CommandEmpty>
                          <CommandGroup>
                            {filteredPlants.map((plant) => (
                              <CommandItem
                                key={plant.id}
                                onSelect={() => togglePlantSelection(plant.id)}
                                className={`cursor-pointer ${
                                  selectedPlantIds.includes(plant.id)
                                    ? "text-secondary font-bold"
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
                                    <Check className="text-primary-foreground h-3 w-3" />
                                  )}
                                </div>
                                <TagIcon className="mr-2 h-4 w-4" />
                                <span>{plant.name}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      )}
                    </Command>
                  </div>

                  <FormDescription className="mt-2">
                    {selectedPlantIds.length > 0
                      ? t("plants-selected", {
                          count: selectedPlantIds.length,
                        })
                      : t("select-plants-optional")}
                  </FormDescription>
                </div>
              </CardContent>

              <CardFooter className="flex w-full gap-2 p-2 sm:p-3 md:gap-6 lg:p-4 xl:p-6">
                <Button
                  type="button"
                  title={t("reset")}
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setSelectedPlantIds(initialConnectedPlantIds);
                    setSearchQuery("");
                  }}
                  className="flex-1"
                >
                  {t("reset")}
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("saving") : pageTexts.submitButtonText}
                </Button>
              </CardFooter>
            </Card>
          </Form>
        </form>
      </FormContent>
    </PageHeader>
  );
}
