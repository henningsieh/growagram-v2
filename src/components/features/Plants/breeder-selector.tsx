import * as React from "react";
import { useTranslations } from "next-intl";
import { BriefcaseIcon } from "lucide-react";
import { toast } from "sonner";
import type { ComboboxOption } from "~/components/atom/combobox-with-create";
import { ComboboxWithCreate } from "~/components/atom/combobox-with-create";
import { FormError } from "~/components/ui/form-error";
import { trpc } from "~/lib/trpc/react";

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
  const [error, setError] = React.useState<string | null>(null);
  const t = useTranslations("Plants");

  const utils = trpc.useUtils();

  // Fetch breeders
  const { data: breeders = [] } = trpc.plants.getBreeders.useQuery();

  // Convert breeders to combobox options
  const breederOptions: ComboboxOption[] = breeders.map((breeder) => ({
    label: breeder.name,
    value: breeder.id,
  }));

  // Create breeder mutation
  const createBreederMutation = trpc.plants.createBreeder.useMutation({
    onSuccess: (data) => {
      onChange(data.id);
      setError(null);
      // Show success toast
      toast(t("breeder-create-success-title"), {
        description: t("breeder-create-success-description"),
      });
      // Invalidate queries to refresh the breeders list
      void utils.plants.getBreeders.invalidate();
    },
    onError: (error) => {
      toast.error(t("breeder-create-error-title"), {
        description: error.message || t("breeder-create-error-description"),
      });
    },
  });

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
