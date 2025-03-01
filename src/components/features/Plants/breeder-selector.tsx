"use client";

import { DnaIcon } from "lucide-react";
import { useState } from "react";
import { ComboboxWithCreate } from "~/components/ui/combobox-with-create";
import type { ComboboxOption } from "~/components/ui/combobox-with-create";
import { FormError } from "~/components/ui/form-error";
import { api } from "~/lib/trpc/react";

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
  const [error, setError] = useState<string | null>(null);

  // Fetch breeders
  const { data: breeders = [] } = api.plants.getBreeders.useQuery();

  // Convert breeders to combobox options
  const breederOptions: ComboboxOption[] = breeders.map((breeder) => ({
    label: breeder.name,
    value: breeder.id,
  }));

  // Create breeder mutation
  const createBreederMutation = api.plants.createBreeder.useMutation({
    onSuccess: (data) => {
      onChange(data.id);
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // Handle create new breeder
  const handleCreateBreeder = async (name: string) => {
    setError(null);
    await createBreederMutation.mutate({ name });
    return createBreederMutation.data?.id || "";
  };

  return (
    <div>
      <ComboboxWithCreate
        options={breederOptions}
        value={value}
        onChange={onChange}
        placeholder="Select a breeder..."
        emptyMessage="No breeders found"
        createNewMessage="Create new breeder"
        disabled={disabled || createBreederMutation.isPending}
        onCreateOption={handleCreateBreeder}
        icon={DnaIcon}
      />
      {error && <FormError message={error} />}
    </div>
  );
}
