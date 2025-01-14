"use client";

import { Clock, TagIcon, TentTree } from "lucide-react";
import { type PropsWithChildren } from "react";
import { modulePaths } from "~/assets/constants";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Link, usePathname } from "~/lib/i18n/routing";

export default function PublicRootLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();

  const navItems = [
    {
      href: modulePaths.PUBLICTIMELINE.path,
      icon: Clock,
      label: modulePaths.PUBLICTIMELINE.name,
    },
    {
      href: modulePaths.PUBLICGROWS.path,
      icon: TentTree,
      label: modulePaths.PUBLICGROWS.name,
    },
    {
      href: modulePaths.PUBLICPLANTS.path,
      icon: TagIcon,
      label: modulePaths.PUBLICPLANTS.name,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl flex-col md:flex-row">
        {/* Left sidebar - hidden on mobile */}
        <aside className="hidden w-60 md:block">
          <div className="sticky top-16 flex flex-col gap-2 px-2">
            {navItems.map((item) => (
              <Link href={item.href} key={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start text-base"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </aside>

        {/* Mobile buttons - shown only on small screens */}
        <div className="sticky top-0 w-full border-b bg-background md:hidden">
          <div className="flex">
            {navItems.map((item) => (
              <Link href={item.href} key={item.href} className="flex-1">
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="h-10 w-full justify-start rounded-none text-xs"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Main content and right sidebar remain unchanged */}
        <div className="flex max-w-2xl flex-1 shrink-0">
          <div className="w-full pl-1 pr-2">{children}</div>
        </div>

        <aside className="hidden w-64 lg:block">
          <div className="sticky top-16 px-4">
            <ScrollArea className="h-[calc(100svh-4rem)]">
              <p>Sidebar :-) (content coming soon)</p>
            </ScrollArea>
          </div>
        </aside>
      </div>
    </div>
  );
}
