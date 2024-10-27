"use client";

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
import navigationData from "~/lib/navigation";
import type { NavigationItem } from "~/lib/navigation";

import { ListItem } from "./list-item";

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
                  className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                  href={content.featured.href}
                >
                  <div className="mb-2 mt-4 text-xl font-bold">
                    {t(content.featured.title)}
                  </div>
                  <p className="text-sm leading-tight text-muted-foreground">
                    {t(content.featured.description.split("-first-plant")[0])}{" "}
                    <b>{t("first-plant")}</b>
                    {"!"}
                  </p>
                </Link>
              </NavigationMenuLink>
            </li>
          )}
          {content.items?.map((item) => (
            <ListItem key={item.title} href={item.href} title={item.title}>
              {item.description}
            </ListItem>
          ))}
        </ul>
      </NavigationMenuContent>
    );
  };

  return (
    <NavigationMenu className="hidden items-center sm:flex">
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
