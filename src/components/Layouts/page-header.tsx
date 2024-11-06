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
    <div className="mx-auto space-y-8 pt-4">
      <div className="flex justify-between px-2 xl:px-12">
        <div className="flex flex-col space-y-2">
          <div className="text-2xl font-bold sm:text-3xl md:text-4xl">
            {title}
          </div>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-end">
          {buttonLink && (
            <Button asChild variant="secondary">
              <Link href={buttonLink}>{buttonLabel}</Link>
            </Button>
          )}
        </div>
      </div>
      <div className="mx-auto max-w-6xl xl:px-12">{children}</div>
    </div>
  );
}
