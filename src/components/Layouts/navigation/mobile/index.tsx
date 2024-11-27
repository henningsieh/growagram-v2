"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
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
import navigationData from "~/lib/navigation";
import type { NavigationItem } from "~/lib/navigation";

export default function MobileNavigationMenu() {
  const [open, setOpen] = useState(false);

  const t = useTranslations("Navigation");

  const renderMenuContent = (content: NavigationItem["content"]) => {
    if (!content) return null;
    return (
      <div className="flex flex-col space-y-2 pl-4">
        {content.featured && (
          <Link
            href={content.featured.href}
            className="rounded-sm bg-gradient-to-b from-secondary/20 to-secondary/60 p-3"
            onClick={() => setOpen(false)}
          >
            <div className="font-bold">{t(content.featured.title)}</div>
            <p className="text-sm text-muted-foreground">
              {t(content.featured.description)}
            </p>
          </Link>
        )}
        {content.items?.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="rounded-sm p-2 text-sm hover:bg-accent"
            onClick={() => setOpen(false)}
          >
            <div className="font-medium">{t(item.title)}</div>
            <p className="text-xs text-muted-foreground">
              {t(item.description)}
            </p>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu width="28" height="28" />
          <span className="sr-only">{t("toggle-menu")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        title="Mobile Navigation"
        description="Layer showing the mobile navigation"
        side="right"
        className="w-full border-r p-0"
      >
        <SheetHeader className="flex items-center justify-between border-b border-border p-4">
          <SheetTitle className="text-lg font-semibold">
            {t("navigation")}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="flex flex-col p-4">
            <Accordion type="single" collapsible className="w-full">
              {navigationData.navigationItems.map((item) =>
                item.type === "link" ? (
                  <Link
                    key={item.title}
                    href={item.href!}
                    className="flex h-10 w-full items-center rounded-sm px-3 text-sm hover:bg-accent"
                    onClick={() => setOpen(false)}
                  >
                    {t(item.title)}
                  </Link>
                ) : (
                  <AccordionItem key={item.title} value={item.title}>
                    <AccordionTrigger className="py-2">
                      {t(item.title)}
                    </AccordionTrigger>
                    <AccordionContent>
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
