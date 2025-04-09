"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import { Link } from "~/lib/i18n/routing";
import { getProcessedNavigationData } from "~/lib/navigation";
import { cn } from "~/lib/utils";

function DesktopNavigationMenu() {
  const t = useTranslations("Navigation");
  const processedNavigation = getProcessedNavigationData();

  return (
    <NavigationMenu className="hidden items-center md:flex">
      <NavigationMenuList className="gap-2">
        {processedNavigation.navigationItems.map((item) => (
          <NavigationMenuItem key={item.title}>
            {item.type === "link" ? (
              <NavigationMenuLink
                asChild
                className={cn(
                  navigationMenuTriggerStyle(),
                  "hover:bg-accent/80 hover:text-accent-foreground text-base font-medium transition-colors",
                )}
              >
                <Link href={item.href!}>{t(item.title)}</Link>
              </NavigationMenuLink>
            ) : (
              <>
                <NavigationMenuTrigger
                  className={cn(
                    "hover:bg-accent/80 hover:text-accent-foreground text-base font-medium transition-colors",
                  )}
                >
                  {t(item.title)}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[500px] p-3 md:grid md:grid-cols-2 md:gap-3">
                    {item.content?.featured && (
                      <div className="from-muted/50 to-muted hover:from-accent/30 hover:to-accent/20 col-span-2 mb-2 rounded-md bg-gradient-to-br p-3 transition-colors">
                        <Link
                          href={item.content.featured.href}
                          className="flex w-full flex-col gap-1"
                        >
                          <div className="flex items-center gap-2">
                            {item.content.featured.icon &&
                              React.createElement(item.content.featured.icon, {
                                className: "h-5 w-5 text-primary",
                                "aria-hidden": true,
                              })}
                            <span className="text-base font-semibold">
                              {t(item.content.featured.title)}
                            </span>
                          </div>
                          <span className="text-muted-foreground text-sm">
                            {t(item.content.featured.description)}
                          </span>
                        </Link>
                      </div>
                    )}
                    <div
                      className={cn(
                        "grid gap-2",
                        item.content?.featured ? "col-span-2 grid-cols-2" : "",
                      )}
                    >
                      {item.content?.items?.map((subItem) => (
                        <Link
                          key={subItem.title}
                          href={subItem.href}
                          className="hover:bg-accent hover:text-accent-foreground flex flex-col gap-1 rounded-md p-3 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            {subItem.icon &&
                              React.createElement(subItem.icon, {
                                className: "h-4 w-4 text-primary",
                                "aria-hidden": true,
                              })}
                            <span className="font-medium">
                              {t(subItem.title)}
                            </span>
                          </div>
                          <span className="text-muted-foreground text-sm">
                            {t(subItem.description)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export default DesktopNavigationMenu;
