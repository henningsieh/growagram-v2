import * as React from "react";
import { Metadata } from "next";
import { useTranslations } from "next-intl";
import { SearchIcon, StarIcon, TrendingUpIcon, UsersIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { generatePageMetadata } from "~/lib/utils/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata("explore", locale);
}

interface ExploreLayoutProps {
  children: React.ReactNode;
}

export default function ExploreLayout({ children }: ExploreLayoutProps) {
  const t = useTranslations("Exploration");

  return (
    <div className="@container min-h-[calc(100svh-7rem)]">
      {/* New Explore Section - Enhanced UI */}
      <div className="from-primary/20 via-accent/15 to-secondary/20 relative m-2 overflow-hidden rounded-lg border bg-gradient-to-br p-2 shadow-lg md:p-4">
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.3),transparent_50%),radial-gradient(circle_at_80%_80%,oklch(0.7_0.192_42/0.2),transparent_50%),radial-gradient(circle_at_40%_80%,rgba(120,200,198,0.2),transparent_50%)]" />

        {/* Subtle animated dots pattern - aligned to border */}
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:14px_14px] bg-[position:0px_0px] [animation-duration:4s]" />

        {/* Main content container with glassmorphism */}
        <div className="bg-card/30 relative z-10 rounded-lg border border-white/10 p-2 shadow-xl backdrop-blur-sm md:p-4">
          <div className="mb-4 flex items-center gap-4">
            <div className="bg-primary/20 border-primary/30 rounded-full border p-3 backdrop-blur-sm">
              <SearchIcon className="text-primary h-6 w-6" />
            </div>
            <div>
              <h1
                className={cn(
                  "text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl",
                  "from-secondary to-primary bg-gradient-to-r bg-clip-text font-bold text-transparent",
                )}
              >
                {t("page-title")}
              </h1>
              <p className="text-muted-foreground mt-1 text-lg">
                {t("page-description")}
              </p>
            </div>
          </div>

          {/* Quick stats or call-to-action */}
          <div className="text-muted-foreground flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <TrendingUpIcon className="text-accent h-4 w-4 shrink-0" />
              <span>Trending grows</span>
            </div>
            <div className="flex items-center gap-1">
              <UsersIcon className="text-primary h-4 w-4 shrink-0" />
              <span>Community favorites</span>
            </div>
            <div className="flex items-center gap-1">
              <StarIcon className="text-secondary h-4 w-4 shrink-0" />
              <span>Featured content</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Vertical Stack */}
      <div className="flex min-h-[calc(100svh-12rem)] flex-col space-y-4">
        {/* Results Section - Full Height */}
        <main className="flex-1 overflow-y-auto p-2 md:p-6">{children}</main>
      </div>
    </div>
  );
}
