"use client";

//src/app/login/page.tsx
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { use } from "react";
import { LoginForm } from "~/components/features/Auth/login-form";
import { redirect } from "~/lib/i18n/routing";

export default function Page(props: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const searchParams = use(props.searchParams);
  const locale = useLocale();
  const { data: session, status } = useSession();

  if (status !== "loading" && session) {
    // Redirect to dashboard if already logged in
    redirect({ href: "/dashboard", locale });
    return null;
  }

  const callbackUrl = searchParams.callbackUrl || "/dashboard";

  return (
    <div className="mx-auto flex max-w-lg items-center justify-center px-4 pt-12 sm:pt-24 md:pt-36">
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
