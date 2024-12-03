"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TRPCClientError } from "@trpc/client";
import { Check, Flower2 } from "lucide-react";
import { useTranslations } from "next-intl";
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
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import {
  CreateOrEditGrowInput,
  GetOwnGrowType,
  GetOwnPlantsInput,
  GrowConnectPlantInput,
  GrowDisconnectPlantInput,
} from "~/server/api/root";
import { growSchema } from "~/types/zodSchema";

type FormValues = z.infer<typeof growSchema>;

export default function GrowForm({ grow }: { grow?: GetOwnGrowType }) {
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
      ? t("buttonLabel-save-changes")
      : t("buttonLabel-create-grow"),
    successToast: {
      title: t("success-title"),
      description: isEditMode
        ? t("success-description-edit")
        : t("success-description-create"),
    },
  };

  const utils = api.useUtils();
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /**
   * Handle TRPC errors and display appropriate toast messages
   */
  const handleTRPCError = (error: unknown) => {
    if (error instanceof TRPCClientError) {
      // Extract the error message, defaulting to a generic error
      const errorMessage = error.message || t("error-default");

      toast({
        title: t("error-title"),
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      // Handle any other unexpected errors
      toast({
        title: t("error-title"),
        description: t("unexpected-error"),
        variant: "destructive",
      });
    }
  };

  /**
   * Mutation to connect a plant to a grow environment.
   */
  const connectPlantMutation = api.grow.connectPlant.useMutation({
    onSuccess: async () => {
      // Invalidate and refetch relevant queries
      await utils.grow.getOwnGrows.invalidate();
      await utils.plant.getOwnPlants.invalidate();
    },
    onError: (error) => {
      handleTRPCError(error);
    },
  });

  /**
   * Mutation to disconnect a plant from a grow environment.
   */
  const disconnectPlantMutation = api.grow.disconnectPlant.useMutation({
    onSuccess: async () => {
      // Invalidate and refetch relevant queries
      await utils.grow.getOwnGrows.invalidate();
      await utils.plant.getOwnPlants.invalidate();
    },
    onError: (error) => {
      handleTRPCError(error);
    },
  });

  // Data fetching and form initialization...
  const initialData = utils.plant.getOwnPlants.getData({
    limit: 100,
    // cursor?: number | null | undefined
  } satisfies GetOwnPlantsInput);
  const { data: plantsData, isLoading } = api.plant.getOwnPlants.useQuery(
    { limit: 100 } satisfies GetOwnPlantsInput,
    {
      initialData: initialData,
    },
  );
  const plants = useMemo(() => plantsData?.plants || [], [plantsData]);

  const initialConnectedPlantIds = useMemo(
    () => grow?.plants?.map((plant) => plant.id) || [],
    [grow?.plants],
  );
  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>(
    initialConnectedPlantIds,
  );

  const filteredPlants = useMemo(() => {
    if (!plants.length) return [];
    return plants.filter(
      (p) =>
        searchQuery === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [plants, searchQuery]);

  const form = useForm<FormValues>({
    mode: "onBlur",
    resolver: zodResolver(growSchema),
    defaultValues: {
      id: grow?.id,
      name: grow?.name || "",
    },
  });

  /**
   * Mutation to create or edit a grow environment.
   */
  const createOrEditGrowMutation = api.grow.createOrEdit.useMutation({
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
          .filter((result) => result.status === "rejected")
          .map((result) => (result as PromiseRejectedResult).reason);

        const disconnectionErrors = disconnectResults
          .filter((result) => result.status === "rejected")
          .map((result) => (result as PromiseRejectedResult).reason);

        if (connectionErrors.length > 0 || disconnectionErrors.length > 0) {
          const errorMessages = [
            ...connectionErrors.map((err) => `${t("connect-error")}: ${err}`),
            ...disconnectionErrors.map(
              (err) => `${t("disconnect-error")}: ${err}`,
            ),
          ];

          throw new Error(errorMessages.join("; "));
        }

        toast({
          title: pageTexts.successToast.title,
          description: pageTexts.successToast.description,
        });

        // Reset and prefetch queries
        await Promise.all([
          utils.grow.getOwnGrows.reset(),
          utils.grow.getOwnGrows.prefetchInfinite({ limit: 12 }),
        ]);

        // Navigate to grows page
        router.push("/grows");
      } catch (error) {
        // Handle specific error types
        handleTRPCError(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    onError: (error) => {
      // Handle mutation creation/edit errors
      handleTRPCError(error);
      setIsSubmitting(false);
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);

    try {
      await createOrEditGrowMutation.mutateAsync(
        values satisfies CreateOrEditGrowInput,
      );
    } catch (error) {
      // Catch any unexpected errors during submission
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
    <Card>
      <CardHeader>
        <CardTitle level="h2">{pageTexts.formTitle}</CardTitle>
        <CardDescription>{pageTexts.formDescription}</CardDescription>
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
                    {t("grow-name")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("grow-name-placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("grow-name-description")}
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
                {isLoading ? (
                  <div className="flex justify-center p-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
                  </div>
                ) : (
                  <CommandList className="min-h-24">
                    <CommandEmpty>{t("no-plants-found")}</CommandEmpty>
                    <CommandGroup>
                      {filteredPlants.map((plant) => (
                        <CommandItem
                          key={plant.id}
                          onSelect={() => togglePlantSelection(plant.id)}
                          className={`cursor-pointer ${
                            selectedPlantIds.includes(plant.id)
                              ? "font-bold text-secondary"
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
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                          <Flower2 className="mr-2 h-4 w-4" />
                          <span>{plant.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                )}
              </Command>
              <FormDescription className="mt-2">
                {selectedPlantIds.length > 0
                  ? t("plants-selected", { count: selectedPlantIds.length })
                  : t("select-plants-optional")}
              </FormDescription>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                title={t("reset")}
                variant="outline"
                onClick={() => {
                  form.reset();
                  setSelectedPlantIds(initialConnectedPlantIds);
                  setSearchQuery("");
                }}
                className="w-full"
              >
                {t("reset")}
              </Button>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? t("saving") : pageTexts.submitButtonText}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
