"use client";

// src/components/features/Plants/plant-form.tsx:
import * as React from "react";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FlowerIcon,
  LeafIcon,
  NutIcon,
  PillBottleIcon,
  SproutIcon,
  TagIcon,
  TentTreeIcon,
  Wheat,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import type {
  CreateOrEditPlantInput,
  GetOwnPlantsInput,
  GetPlantByIdType,
} from "~/server/api/root";
import { plantFormSchema } from "~/types/zodSchema";
import { BreederSelector } from "./breeder-selector";
import PlantFormDateField from "./plant-form-date-fields";
import { StrainSelector } from "./strain-selector";

type FormValues = z.infer<typeof plantFormSchema>;

export default function PlantForm({ plant }: { plant?: GetPlantByIdType }) {
  const utils = api.useUtils();
  const router = useRouter();

  const t = useTranslations("Plants");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedBreederId, setSelectedBreederId] = React.useState<
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
  React.useEffect(() => {
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

  const createOrEditPlantMutation = api.plants.createOrEdit.useMutation({
    onSuccess: async () => {
      toast(t("form-toast-success-title"), {
        description: t("form-toast-success-description"),
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
      toast.error(t("form-toast-error-title"), {
        description: error.message || t("form-toast-error-description"),
      });
    },
  });

  async function onSubmit(values: FormValues) {
    console.debug(values);
    setIsSubmitting(true);
    await createOrEditPlantMutation.mutateAsync(
      values satisfies CreateOrEditPlantInput,
    );
  }

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
                            <TagIcon className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                            <Input
                              className="bg-muted text-foreground pl-10 md:text-base"
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
                            <BreederSelector
                              value={field.value}
                              onChange={field.onChange}
                              disabled={isSubmitting}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          {t("form-breeder-description")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Strain Selection with Create - using new component */}
                  <FormField
                    control={form.control}
                    name="strainId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          {t("strain")}
                        </FormLabel>
                        <FormControl>
                          <StrainSelector
                            value={field.value}
                            breederId={selectedBreederId}
                            onChange={field.onChange}
                            disabled={isSubmitting}
                            existingStrain={
                              plant?.strain
                                ? {
                                    id: plant.strain.id,
                                    name: plant.strain.name,
                                  }
                                : null
                            }
                          />
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
                            <TentTreeIcon className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                            {isGrowsLoading ? (
                              <SpinningLoader />
                            ) : (
                              <Select
                                value={field.value || undefined}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="bg-muted text-foreground pl-10 md:text-base">
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
                          icon={NutIcon}
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
                          icon={SproutIcon}
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
                          description="When did rapid leafIcon growth start?"
                          icon={LeafIcon}
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
                          icon={FlowerIcon}
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
                          icon={PillBottleIcon}
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
                  className="flex-1"
                >
                  {t("form-button-reset")}
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
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
