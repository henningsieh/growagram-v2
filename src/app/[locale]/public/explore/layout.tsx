import * as React from "react";
import { Metadata } from "next";
import { useTranslations } from "next-intl";
import { GrowsFilterPanel } from "~/components/features/Exploration/grows-filter-panel";
import { generatePageMetadata } from "~/lib/utils/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("explore");
}

interface ExploreLayoutProps {
  children: React.ReactNode;
}

export default function ExploreLayout({ children }: ExploreLayoutProps) {
  const t = useTranslations("Exploration");

  return (
    <div className="@container min-h-[calc(100svh-7rem)]">
      {/* Header Section */}
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="flex flex-col space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">
              {t("Grows.title")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("Grows.description")}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area - Vertical Stack */}
      <div className="flex min-h-[calc(100svh-11rem)] flex-col">
        {/* Filter Section - Above Content */}
        <div className="bg-background/50 shrink-0 border-b p-6">
          <GrowsFilterPanel />
        </div>

        {/* Results Section - Below Filters */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
