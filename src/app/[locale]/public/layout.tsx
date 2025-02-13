"use client";

import { Clock, TagIcon, TentTree } from "lucide-react";
import { useTranslations } from "next-intl";
import { type PropsWithChildren } from "react";
import { modulePaths } from "~/assets/constants";
import { Button, type ButtonProps } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Link, usePathname } from "~/lib/i18n/routing";
import { cn } from "~/lib/utils";

export default function PublicRootLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const t = useTranslations("Navigation");

  const navItems = [
    {
      href: modulePaths.PUBLICTIMELINE.path,
      icon: Clock,
      label: modulePaths.PUBLICTIMELINE.name,
      variant: "timeline" as ButtonProps["variant"],
    },
    {
      href: modulePaths.PUBLICGROWS.path,
      icon: TentTree,
      label: modulePaths.PUBLICGROWS.name,
      variant: "grow" as ButtonProps["variant"],
    },
    {
      href: modulePaths.PUBLICPLANTS.path,
      icon: TagIcon,
      label: modulePaths.PUBLICPLANTS.name,
      variant: "plant" as ButtonProps["variant"],
    },
  ];

  return (
    <div className="flex w-full flex-col md:flex-row">
      {/* Left sidebar - hidden on mobile */}
      <aside className="hidden h-screen w-64 md:block md:flex-none">
        <div className="fixed top-0 h-[calc(100svh-4rem)] w-64 overflow-hidden">
          <div className="sticky top-16 flex flex-col gap-2 px-2">
            {navItems.map((item) => (
              <Link href={item.href} key={item.href}>
                <Button
                  variant={
                    pathname.startsWith(item.href) ? item.variant : "outline"
                  }
                  className={cn("w-full justify-start text-base")}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {t(item.label)}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile navigation - shown only on small screens */}
      <nav className="sticky top-[57px] z-10 w-full border-b bg-background px-0 md:hidden">
        <ScrollArea className="w-full">
          <div className="flex w-full">
            {navItems.map((item) => (
              <Link href={item.href} key={item.href} className="flex-1">
                <Button
                  variant={
                    pathname.startsWith(item.href) ? item.variant : "outline"
                  }
                  className={
                    "h-10 w-full rounded-none border-0 p-2 text-xs font-semibold xs:text-sm"
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {t(`Timelines.${item.label}`)}
                </Button>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </nav>

      {/* Main content */}
      <main className="mx-auto w-full max-w-3xl pl-1 pr-3 pt-2">
        <div className="mx-auto">{children}</div>
      </main>

      {/* Right sidebar */}
      <aside className="hidden h-screen w-80 xl:block xl:flex-none">
        <div className="fixed top-0 h-[calc(100svh-4rem)] w-80 overflow-hidden">
          <div className="sticky top-16 flex flex-col rounded-sm bg-muted p-2">
            <h1 className="mb-4 flex items-center justify-center text-2xl font-semibold">
              {t("Sidebar.title")}
            </h1>
            <p className="my-2 bg-accent p-2">Ad Banner</p>
            <p className="my-2 bg-accent p-2">Ad Banner</p>
            <p className="my-2 bg-accent p-2">Ad Banner</p>
            <p className="my-2 bg-accent p-2">Ad Banner</p>
            <p className="my-2 bg-accent p-2">Ad Banner</p>
            <p className="my-2 bg-accent p-2">Ad Banner</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
