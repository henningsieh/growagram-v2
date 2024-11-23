// src/app/error/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SEO Title",
  description: "SEO Title",
};

export default function ErrorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
