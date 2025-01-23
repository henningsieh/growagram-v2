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
import { cn } from "~/lib/utils";

export default function MobileNavigationMenu() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Navigation");

  const renderMenuContent = (content: NavigationItem["content"]) => {
    if (!content) return null;
    return (
      <div className="flex flex-col space-y-3 pl-4">
        {content.featured && (
          <Link
            href={content.featured.href}
            className="flex flex-col justify-center rounded-sm bg-gradient-to-b from-primary/10 via-primary/5 to-primary/20 p-6 text-foreground transition-all hover:from-primary/20 hover:via-primary/15 hover:to-primary/30"
            onClick={() => setOpen(false)}
          >
            <div className="text-2xl font-bold text-primary">
              {t(content.featured.title)}
            </div>
            <p className="text-base text-muted-foreground">
              {t(content.featured.description)}
            </p>
          </Link>
        )}
        {content.items?.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="block space-y-1 rounded-sm p-3 text-foreground/90 transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => setOpen(false)}
          >
            <div className="text-lg font-semibold leading-none">
              {t(item.title)}
            </div>
            <p className="pt-1 text-sm leading-snug text-muted-foreground">
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
        <Button
          variant="ghost"
          size="icon"
          // className="hover:bg-primary/10 hover:text-primary md:hidden"
        >
          <Menu size={32} />
          <span className="sr-only">{t("toggle-menu")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full border-l p-0">
        <SheetHeader className="flex items-center justify-between border-b border-border p-6">
          <SheetTitle className="text-2xl font-bold text-primary">
            {t("navigation")}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100svh-4rem)]">
          <div className="flex flex-col p-4">
            <Accordion type="single" collapsible className="w-full space-y-1.5">
              {navigationData.navigationItems.map((item) =>
                item.type === "link" ? (
                  <Button
                    key={item.title}
                    variant="ghost"
                    className="w-full justify-start p-3 text-lg font-semibold hover:bg-accent hover:text-foreground"
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
                        "rounded-sm px-3 py-3 text-lg font-semibold hover:bg-accent",
                        "hover:text-foreground data-[state=open]:text-primary",
                        "hover:no-underline",
                      )}
                    >
                      {t(item.title)}
                    </AccordionTrigger>
                    <AccordionContent className="pb-1 pt-3">
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
