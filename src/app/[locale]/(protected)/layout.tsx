// src/app/[locale]/(protected)/layout.tsx
import ProtectedSidebar from "./_components/sidebar";

type LayoutProps = {
  children: React.ReactNode;
  params: { locale: string };
};

export default async function ProtectedLayout(props: LayoutProps) {
  return (
    <ProtectedSidebar>
      <>{props.children}</>
    </ProtectedSidebar>
  );
}
