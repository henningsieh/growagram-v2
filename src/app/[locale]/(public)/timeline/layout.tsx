// src/app/[locale]/(public)/timeline/layout.tsx
import { type PropsWithChildren } from "react";

export default function TimelineLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl flex-col md:flex-row">
        {/* Left sidebar - hidden on mobile */}
        <aside className="hidden w-64 shrink-0 bg-stone-900 md:block">
          <div className="sticky top-0 p-4">
            <h2 className="mb-4 text-xl font-bold">Timeline</h2>
            {/* Add sidebar content here */}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex flex-1 shrink-0">
          <div className="mx-auto max-w-2xl">{children}</div>
        </main>

        {/* Right sidebar - hidden on mobile */}
        <aside className="hidden w-60 bg-stone-900 lg:block">
          <div className="sticky top-0 p-4">
            {/* Add right sidebar content here */}
            text
          </div>
        </aside>
      </div>
    </div>
  );
}
