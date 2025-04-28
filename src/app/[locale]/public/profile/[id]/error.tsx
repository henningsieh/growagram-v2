"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function ProfileError({
  error,
  reset = () => window.location.reload(),
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
      <h2 className="text-xl font-semibold">{"Something went wrong!"}</h2>
      <p className="text-muted-foreground">
        {"There was an error loading this profile."}
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {"Try again"}
        </Button>
      </div>
      <p className="text-muted-foreground mt-4 text-xs">
        {"Error: "}
        {error.message}
      </p>
    </div>
  );
}
