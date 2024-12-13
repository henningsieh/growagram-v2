"use client";

// src/components/features/Plants/plant-form.tsx:
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Flower2,
  Leaf,
  Loader2,
  Nut,
  PillBottle,
  Sprout,
  Tag,
  Wheat,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PaginationItemsPerPage } from "~/assets/constants";
import FormContent from "~/components/Layouts/form-content";
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
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import { CreateOrEditPlantInput, GetOwnPlantsInput } from "~/server/api/root";
import { Plant } from "~/types/db";
import { plantFormSchema } from "~/types/zodSchema";

import PlantFormDateField from "./plant-form-date-fields";

type FormValues = z.infer<typeof plantFormSchema>;

export default function PlantFormPage({ plant }: { plant?: Plant }) {
  const utils = api.useUtils();
  const router = useRouter();
  const { toast } = useToast();

  const t = useTranslations("Plants");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    mode: "onBlur",
    resolver: zodResolver(plantFormSchema),
    defaultValues: {
      id: plant?.id,
      name: plant?.name || "",
      startDate: plant?.startDate,
      seedlingPhaseStart: plant?.seedlingPhaseStart || null,
      vegetationPhaseStart: plant?.vegetationPhaseStart || null,
      floweringPhaseStart: plant?.floweringPhaseStart || null,
      harvestDate: plant?.harvestDate || null,
      curingPhaseStart: plant?.curingPhaseStart || null,
    },
  });

  const createOrEditPlantMutation = api.plants.createOrEdit.useMutation({
    onSuccess: async (_, plant) => {
      console.debug("new or edited plant: ", { plant }); // log the plant values
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

      // Now navigate
      router.push("/plants");
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
                <CardTitle level="h2">{t("form-heading")}</CardTitle>
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
                            <Tag className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-accent-foreground" />
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
                          icon={Flower2}
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
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
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
