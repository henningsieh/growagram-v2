"use client";

import { Clock, TagIcon, TentTree } from "lucide-react";
import { type PropsWithChildren } from "react";
import { modulePaths } from "~/assets/constants";
import { Button, ButtonProps } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Link, usePathname } from "~/lib/i18n/routing";
import { cn } from "~/lib/utils";

export default function PublicRootLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();

  const navItems = [
    {
      href: modulePaths.PUBLICTIMELINE.path,
      icon: Clock,
      label: modulePaths.PUBLICTIMELINE.name,
      variant: "timeline" as ButtonProps["variant"],
    },
    {
      href: modulePaths.PUBLICGROWS.path,
      icon: TentTree,
      label: modulePaths.PUBLICGROWS.name,
      variant: "grow" as ButtonProps["variant"],
    },
    {
      href: modulePaths.PUBLICPLANTS.path,
      icon: TagIcon,
      label: modulePaths.PUBLICPLANTS.name,
      variant: "plant" as ButtonProps["variant"],
    },
  ];

  return (
    <div className="bg-background">
      <div className="mx-auto flex max-w-[1440px] flex-col md:flex-row">
        {/* Left sidebar - hidden on mobile */}
        <aside className="hidden h-[calc(100vh-4rem)] shrink-0 px-2 md:block md:w-56 xl:w-64">
          <div className="sticky top-16 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link href={item.href} key={item.href}>
                <Button
                  variant={
                    pathname.startsWith(item.href) ? item.variant : "outline"
                  }
                  className={cn("w-full justify-start text-base")}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </aside>

        {/* Mobile navigation - shown only on small screens */}
        <nav className="sticky top-0 z-10 w-full border-b bg-background pl-0 pr-1 md:hidden">
          <ScrollArea className="w-full">
            <div className="flex w-full">
              {navItems.map((item) => (
                <Link href={item.href} key={item.href} className="flex-1">
                  <Button
                    variant={
                      pathname.startsWith(item.href) ? item.variant : "outline"
                    }
                    className={
                      "h-12 w-full rounded-none border-x-0 px-4 text-xs"
                    }
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </nav>

        {/* Main content */}
        <main className="w-full max-w-2xl pr-1 pt-2 lg:max-w-xl">
          <div className="mx-auto">{children}</div>
        </main>

        {/* Right sidebar */}
        <aside className="hidden p-4 lg:block lg:flex-1 xl:flex-auto">
          <div className="sticky top-16">
            <ScrollArea className="h-[calc(100vh-5rem)]">
              <div className="rounded-lg bg-accent">
                <h2 className="mb-4 text-lg font-semibold">Sidebar</h2>
                <p>Your sidebar content goes here...</p>
              </div>
            </ScrollArea>
          </div>
        </aside>
      </div>
    </div>
  );
}
