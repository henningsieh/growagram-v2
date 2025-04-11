// src/app/[locale]/(protected)/admin/page.tsx:
import { notFound } from "next/navigation";
import PageHeader from "~/components/Layouts/page-header";
import { AdminArea } from "~/components/features/Admin/UserManagement/admin-area";
import { auth } from "~/lib/auth";
import { UserRoles } from "~/types/user";

export default async function AdminPage() {
  // Check for admin permissions
  const session = await auth();

  if (!session?.user || session.user.role !== UserRoles.ADMIN) {
    notFound();
  }

  return (
    <PageHeader
      title="Admin Area"
      subtitle="Administration and management tools"
    >
      <div className="mx-auto w-full max-w-7xl">
        <AdminArea />
      </div>
    </PageHeader>
  );
}
