"use client";

import { Clock, TentTree, Users } from "lucide-react";
import { type PropsWithChildren } from "react";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Link, usePathname } from "~/lib/i18n/routing";

export default function TimelineLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl flex-col md:flex-row">
        {/* Left sidebar - hidden on mobile */}
        <aside className="hidden w-60 md:block">
          <div className="sticky top-16 flex flex-col gap-2 px-2">
            <Link href="/public/timeline">
              <Button
                variant={
                  pathname === "/public/timeline" ? "secondary" : "ghost"
                }
                className="w-full justify-start text-base"
              >
                <Clock className="mr-2 h-4 w-4" />
                Timeline
              </Button>
            </Link>
            <Link href="/public/following">
              <Button
                variant={
                  pathname === "/public/following" ? "secondary" : "ghost"
                }
                className="w-full justify-start text-base"
              >
                <Users className="mr-2 h-4 w-4" />
                Following
              </Button>
            </Link>
            <Link href="/public/grows">
              <Button
                variant={pathname === "/public/grows" ? "secondary" : "ghost"}
                className="w-full justify-start text-base"
              >
                <TentTree className="mr-2 h-4 w-4" />
                All Grows
              </Button>
            </Link>
          </div>
        </aside>

        {/* Mobile tabs - shown only on small screens */}
        <div className="sticky w-full border-b md:hidden">
          <Tabs defaultValue={pathname}>
            <TabsList className="h-7 w-full rounded-none bg-transparent p-0">
              <TabsTrigger
                value="/public/timeline"
                className="w-full rounded-none data-[state=active]:bg-secondary hover:data-[state=inactive]:bg-secondary/20 hover:data-[state=inactive]:text-foreground"
                asChild
              >
                <Link href="/public/timeline">
                  <Clock className="mr-2 h-4 w-4" />
                  Timeline
                </Link>
              </TabsTrigger>
              <TabsTrigger
                value="/public/following"
                className="w-full rounded-none data-[state=active]:bg-secondary hover:data-[state=inactive]:bg-secondary/20 hover:data-[state=inactive]:text-foreground"
                asChild
              >
                <Link href="/public/following">
                  <Users className="mr-2 h-4 w-4" />
                  Following
                </Link>
              </TabsTrigger>
              <TabsTrigger
                value="/public/grows"
                className="w-full rounded-none data-[state=active]:bg-secondary hover:data-[state=inactive]:bg-secondary/20 hover:data-[state=inactive]:text-foreground"
                asChild
              >
                <Link href="/public/grows">
                  <TentTree className="mr-2 h-4 w-4" />
                  All Grows
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {/* Main content and right sidebar remain unchanged */}
        <div className="flex max-w-2xl flex-1 shrink-0">
          <div className="w-full pl-1 pr-2">{children}</div>
        </div>

        <aside className="hidden w-64 lg:block">
          <div className="sticky top-16 px-4">
            <ScrollArea className="h-[calc(100vh-5rem)]">
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
              <p>text</p>
            </ScrollArea>
          </div>
        </aside>
      </div>
    </div>
  );
}
