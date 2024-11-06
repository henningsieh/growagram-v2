"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { isDate } from "date-fns";
import {
  CalendarDays,
  Flower,
  Leaf,
  PillBottle,
  Sprout,
  Wheat,
} from "lucide-react";
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

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Plant name must be at least 2 characters.",
  }),
  startDate: z.date({
    required_error: "Start date is required.",
  }),
  seedlingPhaseStart: z.date().optional().nullable(),
  vegetationPhaseStart: z.date().optional().nullable(),
  floweringPhaseStart: z.date().optional().nullable(),
  harvestDate: z.date().optional().nullable(),
  curingPhaseStart: z.date().optional().nullable(),
});

export default function CreatePlant() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      startDate: undefined,
      seedlingPhaseStart: null,
      vegetationPhaseStart: null,
      floweringPhaseStart: null,
      harvestDate: null,
      curingPhaseStart: null,
    },
  });

  const createPlant = api.plant.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your plant has been created.",
      });
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    createPlant.mutate(values);
  }

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader className="">
        <div className="flex items-center space-x-2">
          <CardTitle>Plant Details</CardTitle>
        </div>
        <CardDescription>
          Complete the fields below to add your plant.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="mb-8">
                  <FormLabel className="flex items-center space-x-2 text-base">
                    <span>Plant Name</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter plant name"
                      className="text-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is the name of your plant so that you can easily
                    remember it.
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
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2 font-medium">
                        <CalendarDays className="h-4 w-4" />
                        <span>Start Date</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={
                            field.value
                              ? field.value.toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) => {
                            const newDate = new Date(e.target.value);
                            if (isDate(newDate)) {
                              field.onChange(newDate);
                            } else {
                              field.onChange(null); // Or handle invalid date case accordingly
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Select the date on which you planted the seed.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seedlingPhaseStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2 font-medium">
                        <Sprout className="h-4 w-4 text-yellow-500" />
                        <span>Seedling Phase</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={
                            field.value
                              ? field.value.toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? new Date(e.target.value) : null,
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Select the date on which the seedling has sprouted.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="vegetationPhaseStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2 font-medium">
                        <Leaf className="h-4 w-4 text-green-500" />
                        <span>Vegetation Phase</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={
                            field.value
                              ? field.value.toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? new Date(e.target.value) : null,
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Select the date on which the vegetation phase began.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="floweringPhaseStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2 font-medium">
                        <Flower className="h-4 w-4 text-pink-500" />
                        <span>Flowering Phase</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={
                            field.value
                              ? field.value.toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? new Date(e.target.value) : null,
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Select the date on which the flowering phase began.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="harvestDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2 font-medium">
                        <Wheat className="h-4 w-4 text-orange-500" />
                        <span>Harvest Date</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={
                            field.value
                              ? field.value.toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? new Date(e.target.value) : null,
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Select the date on which you&apos;ve harvested your
                        weed.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="curingPhaseStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2 font-medium">
                        <PillBottle className="h-4 w-4 text-blue-400" />
                        <span>Curing Phase</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={
                            field.value
                              ? field.value.toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? new Date(e.target.value) : null,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/plants")}
                className="w-full"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Plant"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
