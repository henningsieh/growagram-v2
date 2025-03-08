"use client";

// src/components/Layouts/MainNavigationBar/Desktop/index.tsx:
import { useTranslations } from "next-intl";
import * as React from "react";
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
import { processedNavigation } from "~/lib/navigation";
import { cn } from "~/lib/utils";
import type { ProcessedNavigationItem } from "~/types/navigation";

function DesktopNavigationMenu() {
  const t = useTranslations("Navigation");

  const renderMenuContent = (content: ProcessedNavigationItem["content"]) => {
    if (!content) return null;

    return (
      <NavigationMenuContent>
        <ul className="grid gap-4 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
          {content.featured && (
            <li className="row-span-3">
              <NavigationMenuLink asChild>
                <Link
                  className="nav-item-featured flex h-full w-full select-none flex-col justify-center"
                  href={content.featured.href}
                >
                  <div className="mb-2 mt-4 flex items-center text-2xl font-bold text-primary">
                    {content.featured.icon &&
                      React.createElement(content.featured.icon, {
                        className: "mr-2 h-5 w-5",
                      })}
                    {t(content.featured.title)}
                  </div>
                  <p className="text-base leading-tight text-muted-foreground">
                    {t(content.featured.description)}
                  </p>
                </Link>
              </NavigationMenuLink>
            </li>
          )}
          {content.items?.map((item) => (
            <ListItem key={item.title} href={item.href} title={t(item.title)}>
              {t(item.description)}
            </ListItem>
          ))}
        </ul>
      </NavigationMenuContent>
    );
  };

  const ListItem = React.forwardRef<
    React.ComponentRef<"a">,
    React.ComponentPropsWithoutRef<"a">
  >(({ className, title, children, ...props }, ref) => {
    const item = processedNavigation.navigationItems
      .flatMap((navItem) => navItem.content?.items || [])
      .find((i) => i.href === props.href);

    return (
      <li>
        <NavigationMenuLink asChild>
          <Link
            ref={ref}
            className={cn(
              "nav-item",
              "block select-none space-y-1 leading-none",
              "text-foreground/90 hover:text-foreground",
              className,
            )}
            href={props.href as string}
            {...props}
          >
            <div className="flex items-center text-lg font-semibold leading-none">
              {item?.icon &&
                React.createElement(item.icon, {
                  className: "mr-2 h-5 w-5",
                })}
              {title}
            </div>
            <p className="line-clamp-2 pt-1 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </Link>
        </NavigationMenuLink>
      </li>
    );
  });
  ListItem.displayName = "ListItem";

  return (
    <NavigationMenu className="hidden items-center md:flex">
      <NavigationMenuList className="gap-1">
        {processedNavigation.navigationItems.map((item) => (
          <NavigationMenuItem key={item.title}>
            {item.type === "link" ? (
              <Link href={item.href!} passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "text-lg font-semibold",
                  )}
                  asChild
                >
                  <div>{t(item.title)}</div>
                </NavigationMenuLink>
              </Link>
            ) : (
              <>
                <NavigationMenuTrigger
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "text-lg font-semibold",
                  )}
                >
                  <div>{t(item.title)}</div>
                </NavigationMenuTrigger>
                {renderMenuContent(item.content)}
              </>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export default DesktopNavigationMenu;
