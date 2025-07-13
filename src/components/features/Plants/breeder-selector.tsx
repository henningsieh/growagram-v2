import * as React from "react";

import { useTranslations } from "next-intl";

import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { CannabisIcon } from "lucide-react";
import { toast } from "sonner";

import { FormError } from "~/components/ui/form-error";

import type { ComboboxOption } from "~/components/atom/combobox-with-create";
import { ComboboxWithCreate } from "~/components/atom/combobox-with-create";

import { useTRPC } from "~/lib/trpc/client";

interface BreederSelectorProps {
  value: string | null | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
  existingBreeder?: { id: string; name: string } | null;
}

export function BreederSelector({
  value,
  onChange,
  disabled = false,
  existingBreeder,
}: BreederSelectorProps) {
  const trpc = useTRPC();
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const t = useTranslations("Plants");

  const queryClient = useQueryClient();

  // Debounce the search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Only fetch breeders when we have at least 3 characters
  const shouldFetchBreeders = debouncedSearchTerm.length >= 3;

  // Fetch breeders with search
  const { data: breeders = [], isLoading } = useQuery({
    ...trpc.plants.getBreeders.queryOptions({
      search: debouncedSearchTerm,
      limit: 50,
    }),
    enabled: shouldFetchBreeders,
  });

  // Convert breeders to combobox options
  const breederOptions: ComboboxOption[] = breeders.map((breeder) => ({
    label: breeder.name,
    value: breeder.id,
  }));

  // If we have an existing breeder but it's not in the current list
  if (
    existingBreeder &&
    !breederOptions.some((option) => option.value === existingBreeder.id)
  ) {
    breederOptions.unshift({
      label: existingBreeder.name,
      value: existingBreeder.id,
    });
  }

  // Determine the appropriate empty message based on search state
  const getEmptyMessage = () => {
    if (searchTerm.length === 0) {
      return t("breeder-search-prompt"); // "Type to search for breeders..."
    }
    if (searchTerm.length < 3) {
      return t("breeder-search-minimum"); // "Type at least 3 characters to search..."
    }
    if (isLoading) {
      return t("breeder-searching"); // "Searching..."
    }
    return t("breeder-empty-message"); // "No breeders found"
  };

  // Create breeder mutation
  const createBreederMutation = useMutation(
    trpc.plants.createBreeder.mutationOptions({
      onSuccess: (data) => {
        onChange(data.id);
        setError(null);
        // Show success toast
        toast(t("breeder-create-success-title"), {
          description: t("breeder-create-success-description"),
        });
        // Invalidate queries to refresh the breeders list
        void queryClient.invalidateQueries(
          trpc.plants.getBreeders.pathFilter(),
        );
      },
      onError: (error) => {
        toast.error(t("breeder-create-error-title"), {
          description: error.message || t("breeder-create-error-description"),
        });
      },
    }),
  );

  // Handle create new breeder
  const handleCreateBreeder = (name: string) => {
    setError(null);
    createBreederMutation.mutate({ name });
    return createBreederMutation.data?.id || "";
  };

  return (
    <div>
      <ComboboxWithCreate
        options={breederOptions}
        value={value}
        onChange={onChange}
        onSearchChange={setSearchTerm}
        searchTerm={searchTerm}
        placeholder={t("breeder-placeholder")}
        emptyMessage={getEmptyMessage()}
        createNewMessage={t("breeder-create-message")}
        triggerClassName="bg-muted text-foreground md:text-base"
        disabled={disabled || createBreederMutation.isPending}
        onCreateOption={handleCreateBreeder}
        icon={CannabisIcon}
        iconClassName="size-5.5"
      />
      {error && <FormError message={error} />}
    </div>
  );
}
