// src/app/[locale]/(protected)/layout.tsx
// import { routing } from "~/lib/i18n/routing";
import ProtectedSidebar from "../../../components/Layouts/Sidebar";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default function ProtectedLayout({
  children,
  // params,
}: LayoutProps) {
  // const { locale } = await params;
  // console.debug("params.locale: ", locale);
  // console.debug("routing.locales: ", routing.locales);

  return <ProtectedSidebar>{children}</ProtectedSidebar>;
}
