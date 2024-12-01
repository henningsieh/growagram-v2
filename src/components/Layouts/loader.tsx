import { Loader2 } from "lucide-react";
import React from "react";
import { cn } from "~/lib/utils";

interface SpinningLoaderProps {
  className?: string;
}

export default function SpinningLoader({ className }: SpinningLoaderProps) {
  return (
    <div className={cn("flex justify-center", className)}>
      <Loader2
        className={cn("h-10 w-10 animate-spin text-primary", className)}
      />
    </div>
  );
}
