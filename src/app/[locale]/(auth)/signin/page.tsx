"use client";

import { useTranslations } from "next-intl";
import { LoginForm } from "~/components/features/Auth/login-form";

export default function SignInPage() {
  const t = useTranslations("SignInPage");

  return (
    <div className="mx-auto flex max-w-lg items-center justify-center px-4 pt-12 sm:pt-24 md:pt-36">
      <LoginForm callbackUrl="/dashboard" />
    </div>
  );
}
