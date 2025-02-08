import { Loader2 } from "lucide-react";
import React from "react";
import { cn } from "~/lib/utils";

export default function SpinningLoader({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex justify-center")}>
      <Loader2
        strokeWidth={3}
        className={cn("h-10 w-10 animate-spin text-primary", className)}
      />
    </div>
  );
}
