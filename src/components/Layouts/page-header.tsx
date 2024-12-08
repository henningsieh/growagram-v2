// src/components/Layouts/page-header.tsx:
import { ReadonlyURLSearchParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Link } from "~/lib/i18n/routing";

interface IPageHeader {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  buttonLink?: string | null;
  buttonLabel?: string;
  searchParams?: ReadonlyURLSearchParams;
}

export default function Component({
  title,
  subtitle,
  children,
  buttonLink,
  buttonLabel = "Upload New Image",
  searchParams,
}: IPageHeader) {
  const queryObject = searchParams
    ? Object.fromEntries(searchParams.entries())
    : undefined;

  return (
    <div className="mx-auto space-y-6 pl-3 pr-4 md:pl-2 lg:pl-4 xl:pl-6">
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">
              {title}
            </h1>
          </div>
          <div className="flex items-end">
            {buttonLink && (
              <Button
                asChild
                size="sm"
                className="sm:w-[154px]"
                variant="primary"
              >
                <Link
                  href={{
                    pathname: buttonLink,
                    query: queryObject,
                  }}
                >
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
