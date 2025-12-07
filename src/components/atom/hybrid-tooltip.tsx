"use client";

import * as React from "react";

import {
  PopoverContentProps,
  PopoverProps,
  PopoverTriggerProps,
} from "@radix-ui/react-popover";
import {
  TooltipContentProps,
  TooltipProps,
  TooltipTriggerProps,
} from "@radix-ui/react-tooltip";

import { cn } from "~/lib/utils";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const TouchContext = React.createContext<boolean | undefined>(undefined);
const useTouch = () => React.useContext(TouchContext);

export const TouchProvider = (props: React.PropsWithChildren) => {
  const [isTouch, setTouch] = React.useState<boolean>(true);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");

    const updateTouch = () => setTouch(mediaQuery.matches);
    updateTouch(); // Set the initial value

    mediaQuery.addEventListener("change", updateTouch);

    return () => {
      mediaQuery.removeEventListener("change", updateTouch);
    };
  }, []);

  return <TouchContext.Provider value={isTouch} {...props} />;
};

export const HybridTooltip = (props: TooltipProps & PopoverProps) => {
  const isTouch = useTouch();

  return isTouch ? (
    <Popover {...props} />
  ) : (
    <TooltipProvider>
      <Tooltip {...props} />
    </TooltipProvider>
  );
};

export const HybridTooltipTrigger = (
  props: TooltipTriggerProps & PopoverTriggerProps,
) => {
  const isTouch = useTouch();

  return isTouch ? (
    <PopoverTrigger {...props} />
  ) : (
    <TooltipTrigger {...props} />
  );
};

export const HybridTooltipContent = (
  props: TooltipContentProps & PopoverContentProps,
) => {
  const isTouch = useTouch();
  const { className, ...restProps } = props;

  return isTouch ? (
    <PopoverContent
      className={cn(
        "bg-card text-card-foreground w-auto border p-1 text-sm",
        className,
      )}
      side="top"
      align="center"
      {...restProps}
    />
  ) : (
    <TooltipContent
      className={cn("bg-card text-card-foreground border text-sm", className)}
      side="top"
      align="center"
      {...restProps}
    />
  );
};
