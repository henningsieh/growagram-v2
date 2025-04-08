"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { TRPCClientError } from "@trpc/client";
import {
  ArrowRight,
  Check,
  CircleAlertIcon,
  TagIcon,
  TentTree,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PaginationItemsPerPage, modulePaths } from "~/assets/constants";
import FormContent from "~/components/Layouts/form-content";
import PageHeader from "~/components/Layouts/page-header";
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
import { Link, useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import type {
  CreateOrEditGrowInput,
  GetConnectablePlantsInput,
  GetGrowByIdType,
  GetOwnGrowsInput,
  GrowConnectPlantInput,
  GrowDisconnectPlantInput,
} from "~/server/api/root";
import { GrowsSortField } from "~/types/grow";
import { growSchema } from "~/types/zodSchema";

type FormValues = z.infer<typeof growSchema>;

export default function GrowFormPage({ grow }: { grow?: GetGrowByIdType }) {
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

  const utils = api.useUtils();
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
  const connectPlantMutation = api.grows.connectPlant.useMutation({
    onSuccess: async () => {
      // Invalidate and refetch relevant queries
      await utils.grows.getOwnGrows.invalidate();
      await utils.plants.getOwnPlants.invalidate();

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
  });

  /**
   * Mutation to disconnect a plant from a grow environment.
   */
  const disconnectPlantMutation = api.grows.disconnectPlant.useMutation({
    onSuccess: async () => {
      // Invalidate and refetch relevant queries
      await utils.grows.getOwnGrows.invalidate();
      await utils.plants.getOwnPlants.invalidate();

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
  });

  // fetching connectable plants from utils cache
  const initialData = utils.plants.getConnectablePlants.getData({
    growId: grow?.id,
  } satisfies GetConnectablePlantsInput);

  // Data fetching and form initialization...
  const { data: plantsData, isPending } =
    api.plants.getConnectablePlants.useQuery(
      { growId: grow?.id } satisfies GetConnectablePlantsInput,
      {
        initialData: initialData,
      },
    );
  const plants = React.useMemo(() => plantsData?.plants || [], [plantsData]);

  const initialConnectedPlantIds = React.useMemo(
    () => grow?.plants?.map((plant) => plant.id) || [],
    [grow?.plants],
  );
  const [selectedPlantIds, setSelectedPlantIds] = React.useState<string[]>(
    initialConnectedPlantIds,
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
    resolver: zodResolver(growSchema),
    defaultValues: {
      id: grow?.id,
      name: grow?.name || "",
    },
  });

  /**
   * Mutation to create or edit a grow environment.
   */
  const createOrEditGrowMutation = api.grows.createOrEdit.useMutation({
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
          utils.grows.getOwnGrows.reset(),
          utils.grows.getOwnGrows.prefetchInfinite(queryObject),
          utils.grows.getOwnGrows.prefetch(queryObject),
        ]);

        // Navigate to grows page
        router.push("/grows"); //TODO: add paginated parameters?
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
  });

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
