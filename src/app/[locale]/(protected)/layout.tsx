// src/app/[locale]/(protected)/layout.tsx
import { routing } from "~/lib/i18n/routing";

import ProtectedSidebar from "./_components/sidebar";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: "en" | "de" }>;
};

export default async function ProtectedLayout({
  children,
  params,
}: LayoutProps) {
  const { locale } = await params;
  console.debug("params.locale: ", locale);
  console.debug("routing.locales: ", routing.locales);

  return (
    <ProtectedSidebar>
      <div className="relative">{children}</div>
    </ProtectedSidebar>
  );
}
