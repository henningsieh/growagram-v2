// src/app/[locale]/(protected)/admin/page.tsx:
import { getTranslations } from "next-intl/server";
import { forbidden } from "next/navigation";
import { modulePaths } from "~/assets/constants";
import { BreadcrumbSetter } from "~/components/Layouts/Breadcrumbs/breadcrumb-setter";
import PageHeader from "~/components/Layouts/page-header";
import { AdminArea } from "~/components/features/Admin/UserManagement/admin-area";
import { auth } from "~/lib/auth";
import { createBreadcrumbs } from "~/lib/breadcrumbs";
import { UserRoles } from "~/types/user";

export default async function AdminPage() {
  const session = await auth();
  const t = await getTranslations("AdminArea");

  if (!session?.user || session.user.role !== UserRoles.ADMIN) {
    forbidden();
  }

  // Create breadcrumbs for this page using sidebar translation keys
  const breadcrumbs = createBreadcrumbs([
    {
      translationKey: "AdminArea.navigation.label",
      path: modulePaths.ADMINISTRATION.path,
    },
  ]);

  return (
    <>
      <BreadcrumbSetter items={breadcrumbs} />
      <PageHeader title={t("pageheader.title")} subtitle={t("description")}>
        <AdminArea />
      </PageHeader>
    </>
  );
}
