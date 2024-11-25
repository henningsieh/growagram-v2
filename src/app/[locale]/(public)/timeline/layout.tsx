import { type PropsWithChildren } from "react";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Link } from "~/lib/i18n/routing";

export default function TimelineLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-24 mx-auto flex max-w-7xl flex-col md:flex-row">
        {/* Left sidebar - hidden on mobile */}
        <aside className="hidden w-64 md:block">
          <div className="sticky top-16 bg-stone-900 px-4">
            <Button
              asChild
              variant={"outline"}
              className="mb-4 w-full text-xl font-bold"
            >
              <Link href="/timeline">Timeline</Link>
            </Button>
            <Button variant={"ghost"} className="mb-4 w-full text-xl font-bold">
              Following
            </Button>
            <Button variant={"ghost"} className="mb-4 w-full text-xl font-bold">
              All Grows
            </Button>
            {/* Add sidebar content here */}
          </div>
        </aside>

        {/* Main content - with fixed width */}
        <main className="flex max-w-2xl flex-1 shrink-0 pr-2 sm:pl-2">
          <div className="w-full">{children}</div>
        </main>

        {/* Right sidebar - hidden on mobile */}
        <aside className="hidden w-64 lg:block">
          <div className="sticky top-16 bg-stone-900 px-4">
            <ScrollArea className="h-[calc(100vh-5rem)]">
              {/* Add right sidebar content here */}
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
              {/* ... other text elements ... */}
            </ScrollArea>
          </div>
        </aside>
      </div>
    </div>
  );
}
