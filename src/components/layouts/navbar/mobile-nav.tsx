"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";

export default function MobileNavigationMenu() {
  const t = useTranslations("Navigation");

  const [open, setOpen] = useState(false);

  const menuItems = [
    { name: "Profile", shortcut: "⇧⌘P" },
    { name: "Billing", shortcut: "⌘B" },
    { name: "Settings", shortcut: "⌘S" },
    { name: "Keyboard shortcuts", shortcut: "⌘K" },
    { name: "Team", shortcut: "" },
    { name: "Invite users", shortcut: "" },
    { name: "New Team", shortcut: "⌘+T" },
    { name: "GitHub", shortcut: "" },
    { name: "Support", shortcut: "" },
    { name: "API", shortcut: "", disabled: true },
    { name: "Log out", shortcut: "⇧⌘Q" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu width="28" height="28" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        title="Navigation" // invisible but accessible
        side="right"
        className="w-full border-r p-0"
      >
        <SheetHeader className="flex items-center justify-between border-b border-border p-4">
          <SheetTitle className="text-lg font-semibold">
            {t("navigation")}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="flex flex-col space-y-3 p-4">
            {menuItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start"
                disabled={item.disabled}
                onClick={() => setOpen(false)}
              >
                {item.name}
                {item.shortcut && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {item.shortcut}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
