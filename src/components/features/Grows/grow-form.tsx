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
import { CreateOrEditGrowInput, GetOwnGrowType } from "~/server/api/root";

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
