// src/components/features/Plants/plant-form-date-fields.tsx:
import { X } from "lucide-react";
import { useLocale } from "next-intl";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn, formatDate } from "~/lib/utils";

type PlantFormDateFieldProps<TFieldValues extends FieldValues> = {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  label: string;
  description: string;
  icon: React.ElementType;
  iconClassName?: string;
};

export default function PlantFormDateField<TFieldValues extends FieldValues>({
  field,
  label,
  description,
  icon: Icon,
  iconClassName,
}: PlantFormDateFieldProps<TFieldValues>) {
  const locale = useLocale();

  return (
    <FormItem className="flex flex-col">
      <FormLabel className="font-semibold">{label}</FormLabel>
      <div className="flex items-center space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start px-2 text-left font-normal md:text-base",
                  field.value && "text-foreground",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0",
                )}
              >
                <Icon size={20} className={cn("opacity-80", iconClassName)} />
                {field.value ? formatDate(field.value, locale) : "Pick a date"}
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={field.value}
              onSelect={(date) => field.onChange(date || null)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {field.value && (
          <Button
            type="button"
            variant="destructive"
            className="w-10"
            onClick={() => field.onChange(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <FormDescription>{description}</FormDescription>
      <FormMessage />
    </FormItem>
  );
}
