"use client";

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
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const TouchContext = createContext<boolean | undefined>(undefined);
const useTouch = () => useContext(TouchContext);

export const TouchProvider = (props: PropsWithChildren) => {
  const [isTouch, setTouch] = useState<boolean>(true);

  useEffect(() => {
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

  return isTouch ? <Popover  {...props} /> : <Tooltip {...props} />;
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

  return isTouch ? (
    <PopoverContent  className="w-auto p-2" {...props} side="top" align="center"/>
  ) : (
    <TooltipContent className="bg-background/80 text-base" {...props} />
  );
};
