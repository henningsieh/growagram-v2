"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { MenuIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Link } from "~/lib/i18n/routing";
import { getProcessedNavigationData } from "~/lib/navigation";
import { cn } from "~/lib/utils";
import type { ProcessedNavigationItem } from "~/types/navigation";

export default function MobileNavigationMenu() {
  const [open, setOpen] = React.useState(false);
  const t = useTranslations("Navigation");
  const processedNavigation = getProcessedNavigationData();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="block md:hidden">
        <Button
          variant="outline"
          size="icon"
          className="flex items-center has-[>svg]:m-auto has-[>svg]:px-0"
        >
          <MenuIcon strokeWidth={2.0} className="size-8" />
          <span className="sr-only">{t("toggle-menu")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full border-l p-0">
        <SheetHeader className="border-border flex items-center justify-between border-b p-4">
          <SheetTitle className="text-primary text-xl font-bold">
            {t("navigation")}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100svh-4rem)]">
          <div className="flex flex-col p-4">
            {/* Direct navigation items first with h3 heading but preserving hover effect */}
            {processedNavigation.navigationItems
              .filter((item) => item.type === "link")
              .map((item: ProcessedNavigationItem) => (
                <div key={item.title}>
                  <h3 className="text-lg font-bold">
                    <Link
                      href={item.href!}
                      onClick={() => setOpen(false)}
                      className="text-primary hover:bg-accent hover:text-accent-foreground flex w-full items-center rounded-md p-3 transition-colors"
                    >
                      {/* Only render icon if it exists on the type */}
                      {"icon" in item &&
                        item.icon &&
                        React.createElement(item.icon, {
                          className: "mr-2 h-5 w-5",
                        })}
                      {t(item.title)}
                    </Link>
                  </h3>
                </div>
              ))}

            {/* Divider */}
            <div className="border-border my-1 border-b" />

            {/* Section for drop-down menus expanded directly */}
            {processedNavigation.navigationItems
              .filter((item) => item.type !== "link" && item.content)
              .map((item: ProcessedNavigationItem) => (
                <div key={item.title}>
                  <h3 className="text-primary mb-2 px-3 text-lg font-bold">
                    {/* Don't reference item.icon here */}
                    {t(item.title)}
                  </h3>

                  {/* Featured item */}
                  {item.content?.featured && (
                    <Link
                      href={item.content.featured.href}
                      onClick={() => setOpen(false)}
                      className="bg-muted hover:bg-accent mx-3 mb-2 flex items-center rounded-md p-3 transition-colors"
                    >
                      {item.content.featured.icon &&
                        React.createElement(item.content.featured.icon, {
                          className: "mr-2 h-5 w-5 text-primary",
                        })}
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {t(item.content.featured.title)}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {t(item.content.featured.description)}
                        </span>
                      </div>
                    </Link>
                  )}

                  {/* Regular menu items */}
                  <div className="space-y-1 pl-2">
                    {item.content?.items?.map((subItem) => (
                      <Link
                        key={subItem.title}
                        href={subItem.href}
                        onClick={() => setOpen(false)}
                        className="hover:bg-accent flex rounded-md px-3 py-2 transition-colors"
                      >
                        {subItem.icon &&
                          React.createElement(subItem.icon, {
                            className: "mr-2 h-5 w-5 text-primary",
                          })}
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {t(subItem.title)}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {t(subItem.description)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
