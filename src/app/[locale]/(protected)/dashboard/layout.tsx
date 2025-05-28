// src/app/[locale]/(protected)/dashboard/layout.tsx:
import { Metadata } from "next";
import { generatePageMetadata } from "~/lib/utils/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("dashboard");
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <>{children}</>;
}
