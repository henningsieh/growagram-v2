"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { MenuIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
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
import { processedNavigation } from "~/lib/navigation";
import { cn } from "~/lib/utils";
import type { ProcessedNavigationItem } from "~/types/navigation";

export default function MobileNavigationMenu() {
  const [open, setOpen] = React.useState(false);
  const t = useTranslations("Navigation");

  const renderMenuContent = (content: ProcessedNavigationItem["content"]) => {
    if (!content) return null;
    return (
      <div className="flex flex-col space-y-3 pl-4">
        {content.featured && (
          <Link
            href={content.featured.href}
            className="nav-item-featured flex flex-col justify-center"
            onClick={() => setOpen(false)}
          >
            <div className="text-primary flex items-center text-2xl font-bold">
              {content.featured.icon &&
                React.createElement(content.featured.icon, {
                  className: "mr-2 h-5 w-5",
                })}
              {t(content.featured.title)}
            </div>
            <p className="text-muted-foreground text-base">
              {t(content.featured.description)}
            </p>
          </Link>
        )}
        {content.items?.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="nav-item block space-y-1"
            onClick={() => setOpen(false)}
          >
            <div className="flex items-center text-lg leading-none font-semibold">
              {item.icon &&
                React.createElement(item.icon, {
                  className: "mr-2 h-5 w-5",
                })}
              {t(item.title)}
            </div>
            <p className="text-muted-foreground pt-1 text-sm leading-snug">
              {t(item.description)}
            </p>
          </Link>
        ))}
      </div>
    );
  };

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
        <SheetHeader className="border-border flex items-center justify-between border-b p-6">
          <SheetTitle className="text-primary text-2xl font-bold">
            {t("navigation")}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100svh-4rem)]">
          <div className="flex flex-col p-4">
            <Accordion type="single" collapsible className="w-full space-y-1.5">
              {processedNavigation.navigationItems.map((item) =>
                item.type === "link" ? (
                  <Button
                    key={item.title}
                    asChild
                    variant="ghost"
                    className="hover:bg-accent hover:text-foreground w-full justify-start p-3 text-lg font-semibold"
                  >
                    <Link href={item.href!} onClick={() => setOpen(false)}>
                      {t(item.title)}
                    </Link>
                  </Button>
                ) : (
                  <AccordionItem
                    key={item.title}
                    value={item.title}
                    className="border-none"
                  >
                    <AccordionTrigger
                      className={cn(
                        "rounded-sm px-3 py-3 text-lg font-semibold",
                        "hover:bg-accent hover:text-foreground hover:no-underline",
                        "data-[state=open]:text-primary hover:data-[state=open]:text-accent-foreground",
                      )}
                    >
                      {t(item.title)}
                    </AccordionTrigger>
                    <AccordionContent className="pt-3 pb-1">
                      {renderMenuContent(item.content)}
                    </AccordionContent>
                  </AccordionItem>
                ),
              )}
            </Accordion>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
