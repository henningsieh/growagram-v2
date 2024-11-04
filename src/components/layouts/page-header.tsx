import React from "react";
import { Button } from "~/components/ui/button";
import { Link } from "~/lib/i18n/routing";

interface IPageHeader {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  buttonLink?: string | null;
  buttonLabel?: string;
}

export default function Component({
  title,
  subtitle,
  children,
  buttonLink,
  buttonLabel = "Upload New Image",
}: IPageHeader) {
  return (
    <div className="container mx-auto space-y-8 pt-4">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col space-y-2">
          <div className="text-2xl font-bold sm:text-4xl md:text-5xl">
            {title}
          </div>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        {buttonLink && (
          <Button asChild className="self-end" variant="secondary">
            <Link href={buttonLink}>{buttonLabel}</Link>
          </Button>
        )}
      </div>

      {children}
    </div>
  );
}
