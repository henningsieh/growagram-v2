//src/app/login/page.tsx
import { LoginForm } from "~/components/features/Auth/login-form";

export default function Page() {
  return (
    <div className="mx-auto flex max-w-lg items-center justify-center px-4 pt-12 sm:pt-24 md:pt-36">
      <LoginForm />
    </div>
  );
}
