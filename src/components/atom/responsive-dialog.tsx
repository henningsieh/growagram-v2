"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";

import { cn } from "~/lib/utils";

import { useIsMobile } from "~/hooks/use-mobile";

interface ResponsiveDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  className?: string;
}

interface ResponsiveDialogContextType {
  isMobile: boolean;
}

const ResponsiveDialogContext =
  React.createContext<ResponsiveDialogContextType | null>(null);

function ResponsiveDialogRoot({
  children,
  open,
  onOpenChange,
  trigger,
  className,
}: ResponsiveDialogProps) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <ResponsiveDialogContext.Provider value={{ isMobile }}>
        <Dialog open={open} onOpenChange={onOpenChange}>
          {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
          <DialogContent className={cn("sm:max-w-[600px]", className)}>
            {children}
          </DialogContent>
        </Dialog>
      </ResponsiveDialogContext.Provider>
    );
  }

  return (
    <ResponsiveDialogContext.Provider value={{ isMobile }}>
      <Drawer open={open} onOpenChange={onOpenChange}>
        {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
        <DrawerContent>{children}</DrawerContent>
      </Drawer>
    </ResponsiveDialogContext.Provider>
  );
}

function ResponsiveDialogHeader({ children }: { children: React.ReactNode }) {
  const context = React.useContext(ResponsiveDialogContext);
  if (!context) {
    throw new Error(
      "ResponsiveDialogHeader must be used within ResponsiveDialog",
    );
  }

  if (!context.isMobile) {
    return <DialogHeader>{children}</DialogHeader>;
  }

  return <DrawerHeader className="text-left">{children}</DrawerHeader>;
}

function ResponsiveDialogTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(ResponsiveDialogContext);
  if (!context) {
    throw new Error(
      "ResponsiveDialogTitle must be used within ResponsiveDialog",
    );
  }

  if (!context.isMobile) {
    return (
      <DialogTitle className={cn("text-3xl", className)}>
        {children}
      </DialogTitle>
    );
  }

  return (
    <DrawerTitle className={cn("text-2xl", className)}>{children}</DrawerTitle>
  );
}

function ResponsiveDialogDescription({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = React.useContext(ResponsiveDialogContext);
  if (!context) {
    throw new Error(
      "ResponsiveDialogDescription must be used within ResponsiveDialog",
    );
  }

  if (!context.isMobile) {
    return <DialogDescription>{children}</DialogDescription>;
  }

  return <DrawerDescription>{children}</DrawerDescription>;
}

function ResponsiveDialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(ResponsiveDialogContext);
  if (!context) {
    throw new Error(
      "ResponsiveDialogContent must be used within ResponsiveDialog",
    );
  }

  if (!context.isMobile) {
    return <div className={cn(className)}>{children}</div>;
  }

  return <div className={cn("px-4", className)}>{children}</div>;
}

function ResponsiveDialogFooter({ children }: { children: React.ReactNode }) {
  const context = React.useContext(ResponsiveDialogContext);
  if (!context) {
    throw new Error(
      "ResponsiveDialogFooter must be used within ResponsiveDialog",
    );
  }

  if (!context.isMobile) {
    return (
      <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-2">
        {children}
      </div>
    );
  }

  return (
    <DrawerFooter className="flex flex-col-reverse gap-2 pt-4 md:pt-8">
      {children}
    </DrawerFooter>
  );
}

function ResponsiveDialogClose({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.ComponentProps<typeof DrawerClose>) {
  const context = React.useContext(ResponsiveDialogContext);
  if (!context) {
    throw new Error(
      "ResponsiveDialogClose must be used within ResponsiveDialog",
    );
  }

  if (!context.isMobile) {
    return children;
  }

  return <DrawerClose {...props}>{children}</DrawerClose>;
}

export const ResponsiveDialog = Object.assign(ResponsiveDialogRoot, {
  Header: ResponsiveDialogHeader,
  Title: ResponsiveDialogTitle,
  Description: ResponsiveDialogDescription,
  Content: ResponsiveDialogContent,
  Footer: ResponsiveDialogFooter,
  Close: ResponsiveDialogClose,
});
