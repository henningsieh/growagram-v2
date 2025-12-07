//src/components/Layouts/loader.tsx:
import * as React from "react";

import { Loader2 } from "lucide-react";

import { cn } from "~/lib/utils";

export default function SpinningLoader({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex justify-center")}>
      <Loader2
        strokeWidth={3}
        className={cn("text-foreground h-10 w-10 animate-spin", className)}
      />
    </div>
  );
}
