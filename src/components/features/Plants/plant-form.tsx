"use client";

// src/components/features/Plants/plant-form.tsx:
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BeanIcon,
  DnaIcon,
  Leaf,
  Nut,
  PillBottle,
  Sprout,
  TagIcon,
  TentTreeIcon,
  Wheat,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PaginationItemsPerPage, modulePaths } from "~/assets/constants";
import FormContent from "~/components/Layouts/form-content";
import SpinningLoader from "~/components/Layouts/loader";
import PageHeader from "~/components/Layouts/page-header";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ComboboxWithCreate } from "~/components/ui/combobox-with-create";
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
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import type {
  CreateBreederInput,
  CreateOrEditPlantInput,
  CreateStrainInput,
  GetOwnPlantsInput,
  GetPlantByIdType,
} from "~/server/api/root";
import { plantFormSchema } from "~/types/zodSchema";

import PlantFormDateField from "./plant-form-date-fields";

type FormValues = z.infer<typeof plantFormSchema>;

export default function PlantForm({ plant }: { plant?: GetPlantByIdType }) {
  const utils = api.useUtils();
  const router = useRouter();
  const { toast } = useToast();

  const t = useTranslations("Plants");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBreederId, setSelectedBreederId] = useState<
    string | null | undefined
  >(plant?.strain?.breeder.id || null);

  const form = useForm<FormValues>({
    mode: "onBlur",
    resolver: zodResolver(plantFormSchema),
    defaultValues: {
      id: plant?.id,
      name: plant?.name || "",
      growId: plant?.growId || null,
      strainId: plant?.strainId || null,
      breederId: plant?.strain?.breeder.id || null,
      startDate: plant?.startDate,
      seedlingPhaseStart: plant?.seedlingPhaseStart || null,
      vegetationPhaseStart: plant?.vegetationPhaseStart || null,
      floweringPhaseStart: plant?.floweringPhaseStart || null,
      harvestDate: plant?.harvestDate || null,
      curingPhaseStart: plant?.curingPhaseStart || null,
    },
  });

  // Watch for breeder ID changes
  const watchedBreederId = form.watch("breederId");

  // Set selected breeder when form value changes
  useEffect(() => {
    if (watchedBreederId !== selectedBreederId) {
      setSelectedBreederId(watchedBreederId);
      // Reset strain when breeder changes
      if (selectedBreederId) {
        form.setValue("strainId", null);
      }
    }
  }, [watchedBreederId, selectedBreederId, form]);

  const { data: growsData, isPending: isGrowsLoading } =
    api.grows.getOwnGrows.useQuery(
      {
        limit: 1000,
      },
      {
        initialData: utils.grows.getOwnGrows.getData(),
      },
    );

  const { data: breeders, isPending: isBreedersLoading } =
    api.plants.getBreeders.useQuery();

  const { data: strains, isLoading: isStrainsLoading } =
    api.plants.getStrainsByBreeder.useQuery(
      { breederId: selectedBreederId || undefined },
      { enabled: !!selectedBreederId },
    );

  // Mutations for creating new entities
  const createBreederMutation = api.plants.createBreeder.useMutation();
  const createStrainMutation = api.plants.createStrain.useMutation();

  const createOrEditPlantMutation = api.plants.createOrEdit.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Your plant has been saved.",
      });

      // Reset the infinite query
      await utils.plants.getOwnPlants.reset();
      // Prefetch initial OwnPlants infinite query into cache
      await utils.plants.getOwnPlants.prefetchInfinite({
        limit: PaginationItemsPerPage.PLANTS_PER_PAGE,
      } satisfies GetOwnPlantsInput);

      // Now navigate to the plants page
      router.push(modulePaths.PLANTS.path);
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
    console.debug(values);
    setIsSubmitting(true);
    await createOrEditPlantMutation.mutateAsync(
      values satisfies CreateOrEditPlantInput,
    );
  }

  // Format breeders for combobox
  const breederOptions =
    breeders?.map((breeder) => ({
      label: breeder.name,
      value: breeder.id,
    })) || [];

  // Format strains for combobox
  const strainOptions =
    strains?.map((strain) => ({
      label: strain.name,
      value: strain.id,
    })) || [];

  // Handler for creating a new breeder
  const handleCreateBreeder = async (name: string) => {
    try {
      const result = await createBreederMutation.mutateAsync({
        name,
      } satisfies CreateBreederInput);
      // Invalidate queries to refresh the breeders list
      await utils.plants.getBreeders.invalidate();
      return result.id;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create breeder",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Handler for creating a new strain
  const handleCreateStrain = async (name: string) => {
    if (!selectedBreederId) {
      toast({
        title: "Error",
        description: "Please select a breeder first",
        variant: "destructive",
      });
      throw new Error("Breeder not selected");
    }

    try {
      const result = await createStrainMutation.mutateAsync({
        name,
        breederId: selectedBreederId,
      } satisfies CreateStrainInput);
      // Invalidate queries to refresh the strains list
      await utils.plants.getStrainsByBreeder.invalidate({
        breederId: selectedBreederId,
      });
      return result.id;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create strain",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <PageHeader
      title={
        plant !== undefined
          ? t("form-pagerheader-edit-title")
          : t("form-pagerheader-new-title")
      }
      subtitle={
        plant !== undefined
          ? t("form-pagerheader-edit-subtitle")
          : t("form-pagerheader-new-subtitle")
      }
      buttonLabel={t("form-pageheader-backButtonLabel")}
      buttonLink={"/plants"}
    >
      <FormContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Form {...form}>
            <Card>
              <CardHeader className="p-2 pb-0 sm:p-3 sm:pb-0 lg:p-4 lg:pb-0 xl:p-6 xl:pb-0">
                <CardTitle as="h2">{t("form-heading")}</CardTitle>
                <CardDescription>
                  {t("form-heading-description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-3 lg:p-4 xl:p-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          {t("form-nickname")}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <TagIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              className="bg-muted pl-10 text-foreground md:text-base"
                              placeholder="Enter plant name"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          {t("form-nickname-description")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Breeder Selection with Create */}
                  <FormField
                    control={form.control}
                    name="breederId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          {t("breeder")}
                        </FormLabel>
                        <FormControl>
                          <div>
                            {isBreedersLoading && !plant?.strain?.breeder ? (
                              <div className="relative">
                                <DnaIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <div className="flex h-10 items-center rounded-md border bg-muted pl-10">
                                  <SpinningLoader className="size-5" />
                                </div>
                              </div>
                            ) : (
                              <ComboboxWithCreate
                                options={
                                  plant?.strain?.breeder && !breeders?.length
                                    ? [
                                        {
                                          label: plant.strain.breeder.name,
                                          value: plant.strain.breeder.id,
                                        },
                                      ]
                                    : breederOptions
                                }
                                value={field.value}
                                onChange={(value) => field.onChange(value)}
                                placeholder="Select breeder..."
                                emptyMessage="No breeders found"
                                createNewMessage="Create new breeder"
                                triggerClassName="bg-muted text-foreground md:text-base"
                                onCreateOption={handleCreateBreeder}
                                icon={DnaIcon}
                              />
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          {t("form-breeder-description")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Strain Selection with Create */}
                  <FormField
                    control={form.control}
                    name="strainId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          {t("strain")}
                        </FormLabel>
                        <FormControl>
                          <div>
                            {/* {isStrainsLoading && !plant?.strain ? ( */}
                            {isStrainsLoading ? (
                              <div className="relative">
                                <BeanIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <div className="flex h-10 items-center rounded-md border bg-muted pl-10">
                                  <SpinningLoader className="size-5" />
                                </div>
                              </div>
                            ) : (
                              <ComboboxWithCreate
                                options={
                                  plant?.strain && !strains?.length
                                    ? [
                                        {
                                          label: plant.strain.name,
                                          value: plant.strain.id,
                                        },
                                      ]
                                    : strainOptions
                                }
                                value={field.value}
                                onChange={(value) => field.onChange(value)}
                                placeholder="Select strain..."
                                emptyMessage={
                                  selectedBreederId
                                    ? "No strains found"
                                    : "Please select a breeder first"
                                }
                                createNewMessage="Create new strain"
                                triggerClassName="bg-muted text-foreground md:text-base"
                                disabled={!selectedBreederId}
                                onCreateOption={
                                  selectedBreederId
                                    ? handleCreateStrain
                                    : undefined
                                }
                                icon={BeanIcon}
                              />
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          {t("form-strain-description")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="growId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          {t("form-grow")}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <TentTreeIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            {isGrowsLoading ? (
                              <SpinningLoader />
                            ) : (
                              <Select
                                value={field.value || undefined}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="bg-muted pl-10 text-foreground md:text-base">
                                  <SelectValue
                                    placeholder={t("form-grow-placeholder")}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {growsData?.grows.map((grow) => (
                                    <SelectItem key={grow.id} value={grow.id}>
                                      {grow.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          {t("form-grow-description")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 md:gap-4 lg:gap-6 xl:gap-8">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <PlantFormDateField
                          field={field}
                          label={t("planting-date")}
                          description="When did you plant the seed?"
                          icon={Nut}
                          iconClassName="text-planted"
                        />
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="seedlingPhaseStart"
                      render={({ field }) => (
                        <PlantFormDateField
                          field={field}
                          label={t("germination-date")}
                          description="When did you see the seedling for the first time?"
                          icon={Sprout}
                          iconClassName="text-seedling"
                        />
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 md:gap-4 lg:gap-6 xl:gap-8">
                    <FormField
                      control={form.control}
                      name="vegetationPhaseStart"
                      render={({ field }) => (
                        <PlantFormDateField
                          field={field}
                          label={t("vegetation-start-date")}
                          description="When did rapid leaf growth start?"
                          icon={Leaf}
                          iconClassName="text-vegetation"
                        />
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="floweringPhaseStart"
                      render={({ field }) => (
                        <PlantFormDateField
                          field={field}
                          label={t("flowering-start-date")}
                          description="When did you see the first buds?"
                          icon={TagIcon}
                          iconClassName="text-flowering"
                        />
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 md:gap-4 lg:gap-6 xl:gap-8">
                    <FormField
                      control={form.control}
                      name="harvestDate"
                      render={({ field }) => (
                        <PlantFormDateField
                          field={field}
                          label={t("harvest-date")}
                          description="When did you cut down your plant?"
                          icon={Wheat}
                          iconClassName="text-harvest"
                        />
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="curingPhaseStart"
                      render={({ field }) => (
                        <PlantFormDateField
                          field={field}
                          label={t("curing-start-date")}
                          description="When did you start the curing process?"
                          icon={PillBottle}
                          iconClassName="text-curing"
                        />
                      )}
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex w-full gap-2 p-2 sm:p-3 md:gap-6 lg:p-4 xl:p-6">
                <Button
                  type="button"
                  title="Reset"
                  variant="outline"
                  onClick={() => form.reset()}
                  className="w-full"
                >
                  {t("form-button-reset")}
                </Button>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <SpinningLoader className="mr-2 h-4 w-4" />}
                  {plant?.id
                    ? t("form-button-save-changes")
                    : t("form-button-save-new")}
                </Button>
              </CardFooter>
            </Card>
          </Form>
        </form>
      </FormContent>
    </PageHeader>
  );
}
