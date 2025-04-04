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
      <NavigationMenuList className="gap-1">
        {processedNavigation.navigationItems.map((item) => (
          <NavigationMenuItem key={item.title}>
            {item.type === "link" ? (
              <NavigationMenuLink
                asChild
                className={cn(
                  navigationMenuTriggerStyle(),
                  "text-lg font-medium",
                )}
              >
                <Link href={item.href!}>{t(item.title)}</Link>
              </NavigationMenuLink>
            ) : (
              <>
                <NavigationMenuTrigger className="text-lg font-medium">
                  {t(item.title)}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[500px] gap-3 p-4 md:grid-cols-2">
                    {item.content?.featured && (
                      <div className="hover:bg-accent col-span-2 flex items-start gap-2 rounded-md p-2">
                        <Link
                          href={item.content.featured.href}
                          className="flex w-full flex-col gap-1"
                        >
                          <div className="flex items-center gap-2">
                            {item.content.featured.icon &&
                              React.createElement(item.content.featured.icon, {
                                className: "h-5 w-5 text-primary",
                              })}
                            <span className="text-lg font-medium">
                              {t(item.content.featured.title)}
                            </span>
                          </div>
                          <span className="text-muted-foreground text-sm">
                            {t(item.content.featured.description)}
                          </span>
                        </Link>
                      </div>
                    )}
                    {item.content?.items?.map((subItem) => (
                      <Link
                        key={subItem.title}
                        className="hover:bg-accent hover:text-foreground flex w-full flex-col gap-1 rounded-md p-2"
                        href={subItem.href}
                      >
                        <div className="flex items-center gap-2">
                          {subItem.icon &&
                            React.createElement(subItem.icon, {
                              className: "h-5 w-5 text-primary",
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
