"use client";

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
        <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
          {content.featured && (
            <li className="row-span-3">
              <NavigationMenuLink asChild>
                <Link
                  className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-secondary/20 to-secondary/60 p-3 text-foreground no-underline outline-none focus:shadow-md"
                  href={content.featured.href}
                >
                  <div className="mb-2 mt-4 text-xl font-bold">
                    {t(content.featured.title)}
                  </div>
                  <p className="text-sm leading-tight text-muted-foreground">
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
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
  >(({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <Link
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none text-accent-foreground no-underline outline-none transition-colors hover:bg-accent hover:text-foreground focus:bg-accent focus:text-accent-foreground",
              className,
            )}
            href={props.href as string}
            {...props}
          >
            <div className="text-sm font-bold leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug">{children}</p>
          </Link>
        </NavigationMenuLink>
      </li>
    );
  });
  ListItem.displayName = "ListItem";

  return (
    <NavigationMenu className="hidden items-center md:flex">
      <NavigationMenuList>
        {navigationData.navigationItems.map((item) => (
          <NavigationMenuItem key={item.title}>
            {item.type === "link" ? (
              <Link href={item.href!} passHref>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  asChild
                >
                  <div>{t(item.title)}</div>
                </NavigationMenuLink>
              </Link>
            ) : (
              <>
                <NavigationMenuTrigger>{t(item.title)}</NavigationMenuTrigger>
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
