"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sprout } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { CreateOrEditPlantInput } from "~/server/api/root";
import { Plant } from "~/types/db";
import { plantSchema } from "~/types/zodSchema";

import PlantFormDateField from "./plant-form-date-fields";

type FormValues = z.infer<typeof plantSchema>;

export default function PlantForm({ plant }: { plant?: Plant }) {
  const utils = api.useUtils();
  const router = useRouter();
  const { toast } = useToast();

  const t = useTranslations("Plants");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    mode: "onBlur",
    resolver: zodResolver(plantSchema),
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

  const createOrEditPlantMutation = api.plant.createOrEdit.useMutation({
    onSuccess: async (_, plant) => {
      console.debug("new or edited plant: ", { plant }); // log the plant values
      toast({
        title: "Success",
        description: "Your plant has been saved.",
      });

      // Reset and prefetch the infinite query
      await utils.plant.getOwnPlants.reset();
      await utils.plant.getOwnPlants.prefetchInfinite(
        { limit: 12 }, // match the limit from /plants/page.tsx
      );
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
    <Card>
      <CardHeader className="p-2 sm:p-3 lg:p-4 xl:p-6">
        <CardTitle level="h2">{t("form-heading")}</CardTitle>
        <CardDescription>{t("form-heading-description")}</CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:p-3 lg:p-4 xl:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">
                    {t("form-nickname")}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter plant name" {...field} />
                  </FormControl>
                  <FormDescription>
                    {t("form-nickname-description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <PlantFormDateField
                      field={field}
                      label={t("planting-date")}
                      description="When did you plant the seed?"
                      icon={Sprout}
                      iconClassName="text-planting"
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

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="vegetationPhaseStart"
                  render={({ field }) => (
                    <PlantFormDateField
                      field={field}
                      label={t("vegetation-start-date")}
                      description="When did rapid leaf growth start?"
                      icon={Sprout}
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
                      icon={Sprout}
                      iconClassName="text-flowering"
                    />
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="harvestDate"
                  render={({ field }) => (
                    <PlantFormDateField
                      field={field}
                      label={t("harvest-date")}
                      description="When did you cut down your plant?"
                      icon={Sprout}
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
                      icon={Sprout}
                      iconClassName="text-curing"
                    />
                  )}
                />
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="p-2 sm:p-3 lg:p-4 xl:p-6">
        <div className="flex w-full gap-1">
          <Button
            size="sm"
            type="button"
            title="Reset"
            variant="outline"
            onClick={() => form.reset()}
            className="w-full"
          >
            {t("form-button-reset")}
          </Button>
          <Button
            size="sm"
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {plant?.id
              ? t("form-button-save-changes")
              : t("form-button-save-new")}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
