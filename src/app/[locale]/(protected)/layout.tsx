// src/app/[locale]/(protected)/layout.tsx
// import { headers } from "next/headers";
// eslint-disable-next-line no-restricted-imports
import { redirect } from "next/navigation";
import { auth } from "~/lib/auth";

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
    redirect(
      `/api/auth/signin?callbackUrl=http://localhost:3000/${locale}/dashboard`,
    );
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
