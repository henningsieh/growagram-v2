// src/app/[locale]/(protected)/layout.tsx
import { auth } from "~/lib/auth";
import { redirect } from "~/lib/i18n/routing";

import ProtectedSidebar from "./_components/sidebar";

type LayoutProps = {
  children: React.ReactNode;
  params: { locale: string };
};

export default async function ProtectedLayout(props: LayoutProps) {
  const session = await auth();

  // Await params before accessing params, see:
  // https://nextjs.org/docs/messages/sync-dynamic-apis
  const { locale } = await (props.params as unknown as Promise<
    typeof props.params
  >);

  if (!session) {
    // Redirect to home page with the current locale
    redirect({
      href: `/login?callbackUrl=http://localhost:3000/${locale}/dashboard`,
      locale,
    });
  }

  return (
    <ProtectedSidebar>
      <div className="min-h-screen">
        {/* You can add protected layout elements here, like a dashboard navbar */}
        {props.children}
      </div>
    </ProtectedSidebar>
  );
}
