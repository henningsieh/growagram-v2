// src/app/[locale]/(protected)/admin/page.tsx:
import { getTranslations } from "next-intl/server";
import { forbidden } from "next/navigation";
import PageHeader from "~/components/Layouts/page-header";
import { AdminArea } from "~/components/features/Admin/UserManagement/admin-area";
import { auth } from "~/lib/auth";
import { UserRoles } from "~/types/user";

export default async function AdminPage() {
  // Check for admin permissions
  const session = await auth();

  const t = await getTranslations("AdminArea");

  if (!session?.user || session.user.role !== UserRoles.ADMIN) {
    forbidden();
  }

  return (
    <PageHeader
      title={t("pageheader.title")}
      subtitle={t("pageheader.subtitle")}
    >
      <AdminArea />
    </PageHeader>
  );
}
