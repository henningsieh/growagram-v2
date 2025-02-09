// src/components/UserProfile.tsx
import { useTranslations } from "next-intl";
import PageHeader from "~/components/Layouts/page-header";
import { type User } from "~/lib/db/types";

interface UserProfileProps {
  user: User;
}

export function DashboardContent({ user }: UserProfileProps) {
  // useTranslations() MUST NOT to be async
  const t = useTranslations("Platform");

  return (
    <PageHeader
      title={t("Dashboard-title")}
      subtitle={t("welcome-to-platform-subttitle")}
    >
      <div className="grid items-center justify-items-center gap-4 p-8 pb-20">
        <h1>{user.name}</h1>
        <p>{user.email}</p>
        <p>{user.username}</p>
        <p>{user.role}</p>
      </div>
    </PageHeader>
  );
}
