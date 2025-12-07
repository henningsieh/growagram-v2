// src/app/[locale]/(protected)/admin/page.tsx:
import { forbidden } from "next/navigation";

import { getTranslations } from "next-intl/server";

import { BreadcrumbSetter } from "~/components/Layouts/Breadcrumbs/breadcrumb-setter";
import PageHeader from "~/components/Layouts/page-header";
import { AdminArea } from "~/components/features/Admin/UserManagement/admin-area";

import { UserRoles } from "~/types/user";

import { auth } from "~/lib/auth";
import { createBreadcrumbs } from "~/lib/breadcrumbs/breadcrumbs";

import { modulePaths } from "~/assets/constants";

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
      <PageHeader
        title={t("pageheader.title")}
        subtitle={t("pageheader.subtitle")}
      >
        <AdminArea />
      </PageHeader>
    </>
  );
}
