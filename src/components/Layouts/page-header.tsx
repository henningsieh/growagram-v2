// src/components/Layouts/page-header.tsx:
import type { ReadonlyURLSearchParams } from "next/navigation";
// Import UrlObject
import type { VariantProps } from "class-variance-authority";
import type { UrlObject } from "url";
import { Button, buttonVariants } from "~/components/ui/button";
import { Link } from "~/lib/i18n/routing";

// Update buttonLink type to accept string or UrlObject
type Href = string | UrlObject;

interface IPageHeader {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  buttonLink?: Href | null; // Use Href type
  buttonLabel?: string;
  buttonVariant?: VariantProps<typeof buttonVariants>["variant"];
  buttonIcon?: React.ReactNode;
}

export default function Component({
  title,
  subtitle,
  children,
  buttonLink,
  buttonLabel,
  buttonVariant = "primary",
  buttonIcon,
}: IPageHeader) {
  return (
    <div className="space-y-3 pr-4 pl-3 md:pl-2 lg:pl-4 xl:pl-6">
      <div>
        <div className="flex justify-between">
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
              {title}
            </h1>
          </div>
          <div className="flex items-start">
            {/* Ensure buttonLink is not null/undefined before rendering */}
            {buttonLink && buttonLabel && (
              <Button
                asChild
                size="sm"
                className="min-w-fit lg:min-w-42"
                variant={buttonVariant || "secondary"}
              >
                {/* Pass buttonLink directly to href */}
                <Link href={buttonLink}>
                  {buttonIcon}
                  {buttonLabel}
                </Link>
              </Button>
            )}
          </div>
        </div>
        <p className="text-muted-foreground md:text-lg">{subtitle}</p>
      </div>
      <div className="mx-auto">{children}</div>
    </div>
  );
}
