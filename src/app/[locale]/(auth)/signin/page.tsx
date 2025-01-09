//src/app/sign-in/page.tsx
import { use } from "react";
import { modulePaths } from "~/assets/constants";
import { LoginForm } from "~/components/features/Auth/login-form";

export default function Page(props: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const searchParams = use(props.searchParams);
  const callbackUrl = searchParams.callbackUrl || modulePaths.DASHBOARD.path;

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
