import { useLocale, useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { ControllerRenderProps, FieldValues, Path } from "react-hook-form";
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
import { cn, formatAbsoluteDate } from "~/lib/utils";
import { Locale } from "~/types/locale";

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
  const t = useTranslations("Plants");

  const handleDateSelect = (date: Date | undefined) => {
    field.onChange(date);
  };

  const handleResetClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    field.onChange(null);
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
                  "w-full justify-between pr-1 pl-2 text-left font-normal md:text-base",
                  field.value && "text-foreground",
                  "focus-visible:ring-ring focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:outline-1",
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon size={20} className={cn("opacity-80", iconClassName)} />
                  {field.value
                    ? formatAbsoluteDate(field.value, locale as Locale, { force: true })
                    : t("form-pick-a-date")}
                </div>
                {field.value && (
                  <div
                    role="button"
                    className="ml-auto h-6 w-6 cursor-pointer rounded-md border-2"
                    onClick={handleResetClick}
                  >
                    <X className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="border-primary w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={field.value}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <FormDescription className="px-1">{description}</FormDescription>
    </FormItem>
  );
}
