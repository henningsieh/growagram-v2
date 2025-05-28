import * as React from "react";

// Simple public layout that doesn't impose any specific navigation or sidebars
// Each public route can define its own layout requirements
export default function PublicRootLayout({
  children,
}: React.PropsWithChildren) {
  return <div className="mt-14 w-full">{children}</div>;
}
