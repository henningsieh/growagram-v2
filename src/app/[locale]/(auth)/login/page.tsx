//src/app/login/page.tsx
import { LoginForm } from "~/components/features/auth/login-form";

export default function Page() {
  return (
    <div className="mx-auto flex max-w-lg items-center justify-center px-4 pt-36">
      <LoginForm />
    </div>
  );
}
