import { Loader2 } from "lucide-react";
import React from "react";

export default function SpinningLoader() {
  return (
    <div className="flex justify-center">
      <Loader2 className="h-44 w-44 animate-spin text-primary" />
    </div>
  );
}
