// src/app/[locale]/(protected)/layout.tsx:
import ProtectedSidebar from "../../../components/Layouts/Sidebar";

type LayoutProps = {
  children: React.ReactNode;
};

export default function ProtectedRootLayout({ children }: LayoutProps) {
  return <ProtectedSidebar>{children}</ProtectedSidebar>;
}
