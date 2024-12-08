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

  const handleDateSelect = (date: Date | undefined) => {
    field.onChange(date);
    // The Popover will automatically close when the date is selected
  };

  const handleResetClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    field.onChange(null);
    // The Popover will automatically close when the reset button is clicked
  };

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
                  "w-full justify-between pl-2 pr-1 text-left font-normal md:text-base",
                  field.value && "text-foreground",
                  "focus-visible:outline-1 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0",
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon size={20} className={cn("opacity-80", iconClassName)} />
                  {field.value
                    ? formatDate(field.value, locale)
                    : "Pick a date"}
                </div>
                {field.value && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="ml-auto h-6 w-6"
                    onClick={handleResetClick}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-auto border-primary p-0" align="start">
            <Calendar
              mode="single"
              selected={field.value}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <FormDescription>{description}</FormDescription>
    </FormItem>
  );
}
