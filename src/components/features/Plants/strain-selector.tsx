"use client";

import { BeanIcon } from "lucide-react";
import { useState } from "react";
import SpinningLoader from "~/components/Layouts/loader";
import { ComboboxWithCreate } from "~/components/ui/combobox-with-create";
import type { ComboboxOption } from "~/components/ui/combobox-with-create";
import { FormError } from "~/components/ui/form-error";
import { useToast } from "~/hooks/use-toast";
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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
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
      // Invalidate queries to refresh the strains list
      void utils.plants.getStrainsByBreeder.invalidate({
        breederId: breederId || undefined,
      });
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // Handle create new strain
  const handleCreateStrain = async (name: string) => {
    if (!breederId) {
      toast({
        title: "Error",
        description: "Please select a breeder first",
        variant: "destructive",
      });
      throw new Error("Breeder not selected");
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
        <BeanIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <div className="flex h-10 items-center rounded-md border bg-muted pl-10">
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
        placeholder="Select strain..."
        emptyMessage={
          breederId ? "No strains found" : "Please select a breeder first"
        }
        createNewMessage="Create new strain"
        triggerClassName="bg-muted text-foreground md:text-base"
        disabled={disabled || !breederId || createStrainMutation.isPending}
        onCreateOption={handleCreateStrain}
        icon={BeanIcon}
      />
      {error && <FormError message={error} />}
    </div>
  );
}
