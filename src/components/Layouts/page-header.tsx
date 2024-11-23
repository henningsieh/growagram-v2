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
    <div className="mx-auto space-y-8">
      <div className="flex justify-between xl:px-8">
        <div className="flex flex-col space-y-2">
          <div className="text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">
            {title}
          </div>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-start">
          {buttonLink && (
            <Button asChild size="sm" variant="primary">
              <Link href={buttonLink}>{buttonLabel}</Link>
            </Button>
          )}
        </div>
      </div>
      <div className="mx-auto xl:px-8">{children}</div>
    </div>
  );
}
