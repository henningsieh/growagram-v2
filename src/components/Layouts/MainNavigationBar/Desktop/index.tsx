"use client";

// src/components/Layouts/MainNavigationBar/Desktop/index.tsx:
import { useTranslations } from "next-intl";
import { forwardRef } from "react";
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
import type { NavigationItem } from "~/lib/navigation";
import navigationData from "~/lib/navigation";
import { cn } from "~/lib/utils";

function DesktopNavigationMenu() {
  const t = useTranslations("Navigation");

  const renderMenuContent = (content: NavigationItem["content"]) => {
    if (!content) return null;

    return (
      <NavigationMenuContent>
        <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
          {content.featured && (
            <li className="row-span-3">
              <NavigationMenuLink asChild>
                <Link
                  className="flex h-full w-full select-none flex-col justify-center rounded-lg bg-gradient-to-b from-primary/10 via-primary/5 to-primary/20 p-6 no-underline outline-none transition-all hover:from-primary/20 hover:via-primary/15 hover:to-primary/30 focus:shadow-md"
                  href={content.featured.href}
                >
                  {/* Navigation featured item title */}
                  <div className="mb-2 mt-4 text-2xl font-bold text-primary">
                    {t(content.featured.title)}
                  </div>
                  {/* Navigation featured item description */}
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

  const ListItem = forwardRef<
    React.ComponentRef<"a">,
    React.ComponentPropsWithoutRef<"a">
  >(({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <Link
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors",
              "text-foreground/90 hover:bg-accent hover:text-accent-foreground",
              "focus:bg-accent focus:text-accent-foreground",
              className,
            )}
            href={props.href as string}
            {...props}
          >
            {/* Navigation item title */}
            <div className="text-lg font-semibold leading-none">{title}</div>
            {/* Navigation item description */}
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
        {navigationData.navigationItems.map((item) => (
          <NavigationMenuItem key={item.title}>
            {item.type === "link" ? (
              <Link href={item.href!} passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "text-lg font-semibold hover:text-primary",
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
                    "text-lg font-semibold hover:text-primary",
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
