"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Sprout } from "lucide-react";
import { useMemo, useState } from "react";
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
import {
  CreateOrEditGrowInput,
  GetOwnGrowType,
  GetOwnPlantsInput,
  GetOwnPlantsOutput,
} from "~/server/api/root";

// Define the schema for grow form validation
const growSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Grow name is required"),
});

type FormValues = z.infer<typeof growSchema>;

export default function GrowForm({ grow }: { grow?: GetOwnGrowType }) {
  const utils = api.useUtils();
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialData = utils.plant.getOwnPlants.getData();
  console.debug("initialData: ", initialData);

  const { data: plantsData, isLoading } = api.plant.getOwnPlants.useQuery(
    { limit: 100 } satisfies GetOwnPlantsInput,
    {
      // Use the data that was prefetched on the server
      initialData: initialData,
    },
  );

  // Move plants array into useMemo to ensure stable reference
  const plants = useMemo(
    () => (plantsData satisfies GetOwnPlantsOutput | undefined)?.plants || [],
    [plantsData],
  );

  console.debug("plants: ", plants);
  //   browser console output:
  //   plants:
  //     Array(4) [ {…}, {…}, {…}, {…} ]
  //     ​
  //     0: Object { id: "be3531f2-a01f-42dc-8aa9-9fd08cd34696", name: "test 33", ownerId: "bb7a2666-3827-485e-a1ed-836981451a95", … }
  //     ​
  //     1: Object { id: "68acee7d-7d21-47e4-8723-29291c4ce998", name: "test", ownerId: "bb7a2666-3827-485e-a1ed-836981451a95", … }
  //     ​
  //     2: Object { id: "4763f983-8341-445e-bc88-676e9d911ce1", name: "n/a", ownerId: "bb7a2666-3827-485e-a1ed-836981451a95", … }
  //     ​
  //     3: Object { id: "89d028ca-b24c-49ef-98a1-8c05a633c6fb", name: "Cheesy Cheese", ownerId: "bb7a2666-3827-485e-a1ed-836981451a95", … }
  //     ​
  //     length: 4

  const form = useForm<FormValues>({
    mode: "onBlur",
    resolver: zodResolver(growSchema),
    defaultValues: {
      id: grow?.id,
      name: grow?.name || "",
    },
  });

  const createOrEditGrowMutation = api.grow.createOrEdit.useMutation({
    onSuccess: async (_, values) => {
      toast({
        title: "Success",
        description: "Your grow has been created.",
      });

      // Reset and prefetch the infinite query
      await utils.grow.getOwnGrows.reset();
      await utils.grow.getOwnGrows.prefetchInfinite(
        { limit: 12 }, // match the limit from grows page
      );

      // Navigate to grows page
      router.push("/grows");
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
    setIsSubmitting(true);
    await createOrEditGrowMutation.mutateAsync(
      values satisfies CreateOrEditGrowInput,
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle level="h2">Grow Setup</CardTitle>
        <CardDescription>
          Create and name your new grow environment.
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
                  <FormLabel className="font-semibold">Grow Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter grow name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Give your grow a descriptive name, like &quot;Summer Indoor
                    Grow&quot; or &quot;Backyard Greenhouse&quot;.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  : grow?.id
                    ? "Save Changes"
                    : "Create Grow"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
