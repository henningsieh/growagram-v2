"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { VariantProps } from "class-variance-authority";
import { ClockIcon, Flower2Icon, TentTree } from "lucide-react";
import { modulePaths } from "~/assets/constants";
import { Button, buttonVariants } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Link, usePathname } from "~/lib/i18n/routing";
import { cn } from "~/lib/utils";

export default function PublicRootLayout({
  children,
}: React.PropsWithChildren) {
  const pathname = usePathname();
  const t = useTranslations("Navigation");

  const navItems = [
    {
      href: modulePaths.PUBLICTIMELINE.path,
      icon: ClockIcon,
      label: modulePaths.PUBLICTIMELINE.name,
      variant: "timeline" as VariantProps<typeof buttonVariants>["variant"],
    },
    {
      href: modulePaths.PUBLICGROWS.path,
      icon: TentTree,
      label: modulePaths.PUBLICGROWS.name,
      variant: "grow" as VariantProps<typeof buttonVariants>["variant"],
    },
    {
      href: modulePaths.PUBLICPLANTS.path,
      icon: Flower2Icon,
      label: modulePaths.PUBLICPLANTS.name,
      variant: "plant" as VariantProps<typeof buttonVariants>["variant"],
    },
  ];

  return (
    <div className="flex w-full flex-col md:flex-row">
      {/* Left sidebar - hidden on mobile */}
      <aside className="hidden h-screen w-64 md:block md:flex-none">
        <div className="fixed top-0 h-[calc(100svh-4rem)] w-64 overflow-hidden">
          <div className="sticky top-16 flex flex-col gap-2 px-2">
            {navItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant={
                  pathname.startsWith(item.href) ? item.variant : "outline"
                }
                className={cn("w-full justify-start text-base")}
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {t(item.label)}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile navigation - shown only on small screens */}
      <nav className="bg-background sticky top-[57px] z-10 w-full border-b px-0 md:hidden">
        <ScrollArea className="w-full">
          <div className="flex w-full">
            {navItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant={
                  pathname.startsWith(item.href) ? item.variant : "outline"
                }
                className={
                  "xs:text-sm h-10 w-full rounded-none border-0 p-2 text-xs font-semibold"
                }
              >
                <Link href={item.href} className="flex-1">
                  <item.icon className="h-4 w-4" />
                  {t(`Timelines.${item.label}`)}
                </Link>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </nav>

      {/* Main content */}
      <main className="mx-auto mt-14 w-full max-w-3xl pt-2 pr-3 pl-1">
        <div>{children}</div>
      </main>

      {/* Right sidebar */}
      <aside className="hidden h-screen w-80 xl:block xl:flex-none">
        <div className="fixed top-0 h-[calc(100svh-4rem)] w-80 overflow-hidden">
          <div className="bg-muted sticky top-16 flex flex-col rounded-sm p-2">
            <h1 className="mb-4 flex items-center justify-center text-2xl font-semibold">
              {t("Sidebar.title")}
            </h1>
            <p className="bg-accent my-2 p-2">{"Ad Banner"}</p>
            <p className="bg-accent my-2 p-2">{"Ad Banner"}</p>
            <p className="bg-accent my-2 p-2">{"Ad Banner"}</p>
            <p className="bg-accent my-2 p-2">{"Ad Banner"}</p>
            <p className="bg-accent my-2 p-2">{"Ad Banner"}</p>
            <p className="bg-accent my-2 p-2">{"Ad Banner"}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
