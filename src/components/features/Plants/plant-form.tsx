"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Sprout } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Plant } from "~/types/db";
import { plantSchema } from "~/types/zodSchema";

import PlantFormDateField from "./plant-form-date-fields";

type FormValues = z.infer<typeof plantSchema>;

export default function PlantForm({ plant }: { plant?: Plant }) {
  const utils = api.useUtils();
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    mode: "onBlur",
    resolver: zodResolver(plantSchema),
    defaultValues: {
      id: plant?.id,
      name: plant?.name,
      startDate: plant?.startDate,
      seedlingPhaseStart: plant?.seedlingPhaseStart || undefined,
      vegetationPhaseStart: plant?.vegetationPhaseStart || undefined,
      floweringPhaseStart: plant?.floweringPhaseStart || undefined,
      harvestDate: plant?.harvestDate || undefined,
      curingPhaseStart: plant?.curingPhaseStart || undefined,
    },
  });

  const createOrEditPlant = api.plant.createOrEdit.useMutation({
    onSuccess: async (_, values) => {
      console.debug("values: ", values);
      toast({
        title: "Success",
        description: "Your plant has been created.",
      });

      // Reset and prefetch the infinite query
      await utils.plant.getOwnPlants.reset();
      await utils.plant.getOwnPlants.prefetchInfinite(
        { limit: 12 }, // match the limit from your PlantsPage
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

  function onSubmit(values: FormValues) {
    console.debug(values);
    setIsSubmitting(true);
    createOrEditPlant.mutate(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plant Journey</CardTitle>
        <CardDescription>
          Edit the plant&apos;s name and relevant dates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">
                    Plant Nickname
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter plant name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Give your plant a memorable name.
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
                      label="Seed Planted"
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
                      label="First Sprout"
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
                      label="Entered Veg Stage"
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
                      label="Started Flowering"
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
                      label="Harvest Day"
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
                      label="Started Curing"
                      description="When did you start the curing process?"
                      icon={Sprout}
                      iconClassName="text-curing"
                    />
                  )}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                title="Reset"
                variant="outline"
                onClick={() => form.reset()}
                className="w-full"
              >
                Reset
              </Button>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : plant?.id
                    ? "Save Changes"
                    : "Create Plant"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
