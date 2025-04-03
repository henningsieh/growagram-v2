import * as React from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

export type ComboboxOption = {
  label: string;
  value: string;
};

export type ComboboxWithCreateProps = {
  options: ComboboxOption[];
  value: string | null | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  createNewMessage?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  onCreateOption?: (label: string) => Promise<string> | string;
  icon?: LucideIcon;
  iconClassName?: string;
};

export function ComboboxWithCreate({
  options,
  value,
  onChange,
  placeholder,
  emptyMessage,
  createNewMessage,
  disabled = false,
  className,
  triggerClassName,
  onCreateOption,
  icon: Icon,
  iconClassName,
}: ComboboxWithCreateProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);
  const t = useTranslations("Common");

  // Use translations with fallbacks to props
  const translatedPlaceholder = placeholder || t("combobox-placeholder");
  const translatedEmptyMessage = emptyMessage || t("combobox-empty-message");
  const translatedCreateNewMessage =
    createNewMessage || t("combobox-create-message");

  const selectedOption = options.find((option) => option.value === value);

  // Initialize and update inputValue when selectedOption changes
  React.useEffect(() => {
    if (selectedOption && !open) {
      setInputValue(selectedOption.label);
    }
  }, [selectedOption, open]);

  // Get filtered options based on input
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const handleCreateNew = async () => {
    if (!inputValue.trim() || isCreating) return;

    setIsCreating(true);
    try {
      if (onCreateOption) {
        const newValue = await onCreateOption(inputValue);
        onChange(newValue);
      } else {
        // Default behavior if no creation handler provided
        onChange(inputValue);
      }
      setOpen(false);
    } catch (error) {
      console.error("Failed to create new option", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Check if the exact input matches any existing option
  const exactMatch = options.some(
    (option) => option.label.toLowerCase() === inputValue.toLowerCase(),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            Icon && "relative pl-10",
            disabled ? "opacity-70" : "",
            triggerClassName,
          )}
          onClick={() => {
            // Clear input when opening if no selection
            if (!selectedOption) {
              setInputValue("");
            }
          }}
        >
          {Icon && (
            <span className="absolute top-1/2 left-3 -translate-y-1/2">
              <Icon
                className={cn("text-muted-foreground h-5 w-5", iconClassName)}
              />
            </span>
          )}
          <span className={cn("pl-7", selectedOption && "font-bold")}>
            {selectedOption ? selectedOption.label : translatedPlaceholder}
          </span>

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[var(--radix-popover-trigger-width)]", className)}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={translatedPlaceholder}
            onValueChange={setInputValue}
            value={inputValue}
          />
          <CommandList>
            {filteredOptions.length === 0 && (
              <CommandEmpty>
                {translatedEmptyMessage}
                {inputValue && onCreateOption && !exactMatch && (
                  <Button
                    variant="ghost"
                    className="mt-2 w-full justify-start"
                    onClick={handleCreateNew}
                    disabled={isCreating}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {translatedCreateNewMessage}
                    {': "'}
                    {inputValue}
                    {'"'}
                    {isCreating && "..."}
                  </Button>
                )}
              </CommandEmpty>
            )}

            {filteredOptions.length > 0 && (
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      onChange(option.value);
                      setInputValue(option.label);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {inputValue &&
              onCreateOption &&
              !exactMatch &&
              filteredOptions.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={handleCreateNew}
                      disabled={isCreating}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {translatedCreateNewMessage}
                      {': "'}
                      {inputValue}
                      {'"'}
                      {isCreating && "..."}
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
