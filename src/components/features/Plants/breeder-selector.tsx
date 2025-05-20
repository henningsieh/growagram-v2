import * as React from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { BriefcaseIcon } from "lucide-react";
import { toast } from "sonner";
import type { ComboboxOption } from "~/components/atom/combobox-with-create";
import { ComboboxWithCreate } from "~/components/atom/combobox-with-create";
import { FormError } from "~/components/ui/form-error";
import { useTRPC } from "~/lib/trpc/client";

interface BreederSelectorProps {
  value: string | null | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function BreederSelector({
  value,
  onChange,
  disabled = false,
}: BreederSelectorProps) {
  const trpc = useTRPC();
  const [error, setError] = React.useState<string | null>(null);
  const t = useTranslations("Plants");

  const queryClient = useQueryClient();

  // Fetch breeders
  const { data: breeders = [] } = useQuery(
    trpc.plants.getBreeders.queryOptions(),
  );

  // Convert breeders to combobox options
  const breederOptions: ComboboxOption[] = breeders.map((breeder) => ({
    label: breeder.name,
    value: breeder.id,
  }));

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
        placeholder={t("breeder-placeholder")}
        emptyMessage={t("breeder-empty-message")}
        createNewMessage={t("breeder-create-message")}
        triggerClassName="bg-muted text-foreground md:text-base"
        disabled={disabled || createBreederMutation.isPending}
        onCreateOption={handleCreateBreeder}
        icon={BriefcaseIcon}
      />
      {error && <FormError message={error} />}
    </div>
  );
}
