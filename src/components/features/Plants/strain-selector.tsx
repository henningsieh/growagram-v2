"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { BeanIcon } from "lucide-react";
import { toast } from "sonner";
import { ComboboxWithCreate } from "~/components/atom/combobox-with-create";
import type { ComboboxOption } from "~/components/atom/combobox-with-create";
import SpinningLoader from "~/components/atom/spinning-loader";
import { FormError } from "~/components/ui/form-error";
import { api } from "~/lib/trpc/react";

interface StrainSelectorProps {
  value: string | null | undefined;
  breederId: string | null | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
  existingStrain?: { id: string; name: string } | null;
}

export function StrainSelector({
  value,
  breederId,
  onChange,
  disabled = false,
  existingStrain,
}: StrainSelectorProps) {
  const [error, setError] = React.useState<string | null>(null);
  const t = useTranslations("Plants");

  const utils = api.useUtils();

  // Fetch strains for the selected breeder
  const { data: strains, isLoading: isStrainsLoading } =
    api.plants.getStrainsByBreeder.useQuery(
      { breederId: breederId || undefined },
      { enabled: !!breederId },
    );

  // Format strains for combobox
  const strainOptions: ComboboxOption[] =
    strains?.map((strain) => ({
      label: strain.name,
      value: strain.id,
    })) || [];

  // If we have an existing strain but it's not in the current list
  if (
    existingStrain &&
    !strainOptions.some((option) => option.value === existingStrain.id)
  ) {
    strainOptions.unshift({
      label: existingStrain.name,
      value: existingStrain.id,
    });
  }

  // Create strain mutation
  const createStrainMutation = api.plants.createStrain.useMutation({
    onSuccess: (data) => {
      onChange(data.id);
      setError(null);
      // Show success toast
      toast(t("strain-create-success-title"), {
        description: t("strain-create-success-description"),
      });
      // Invalidate queries to refresh the strains list
      void utils.plants.getStrainsByBreeder.invalidate({
        breederId: breederId || undefined,
      });
    },
    onError: (error) => {
      toast.error(t("strain-create-error-title"), {
        description: error.message || t("strain-create-error-description"),
      });
    },
  });

  // Verify breeder is selected before creating strain
  const handleCreateStrain = async (name: string) => {
    if (!breederId) {
      toast.error(t("strain-breeder-required-error-title"), {
        description: t("strain-breeder-required-error-description"),
      });
      return "";
    }

    setError(null);
    try {
      const result = await createStrainMutation.mutateAsync({
        name,
        breederId,
      });
      return result.id;
    } catch (error) {
      throw error;
    }
  };

  if (isStrainsLoading) {
    return (
      <div className="relative">
        <BeanIcon className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
        <div className="bg-muted flex h-10 items-center rounded-md border pl-10">
          <SpinningLoader className="size-5" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <ComboboxWithCreate
        options={strainOptions}
        value={value}
        onChange={onChange}
        placeholder={t("strain-placeholder")}
        emptyMessage={
          breederId
            ? t("strain-empty-message-with-breeder")
            : t("strain-empty-message-no-breeder")
        }
        createNewMessage={t("strain-create-message")}
        triggerClassName="bg-muted text-foreground md:text-base"
        disabled={disabled || !breederId || createStrainMutation.isPending}
        onCreateOption={handleCreateStrain}
        icon={BeanIcon}
      />
      {error && <FormError message={error} />}
    </div>
  );
}
