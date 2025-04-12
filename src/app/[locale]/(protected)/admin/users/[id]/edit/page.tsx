// src/app/[locale]/(protected)/admin/users/[id]/edit/page.tsx
import { forbidden, notFound } from "next/navigation";
import AdminUserEditForm from "~/components/features/Admin/UserManagement/components/edit-user-form";
import { auth } from "~/lib/auth";
import { AdminGetUserByIdInput } from "~/server/api/root";
import { UserRoles } from "~/types/user";

interface EditUserPageProps {
  params: Promise<AdminGetUserByIdInput>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  // Get the current user's session and check for admin permissions
  const session = await auth();

  // Check if the user is logged in and is an admin
  if (!session?.user || session.user.role !== UserRoles.ADMIN) {
    forbidden();
  }

  const userId = (await params).id;
  if (!userId) {
    notFound();
  }

  // Render the user edit form with the user ID
  return <AdminUserEditForm userId={userId} />;
}
