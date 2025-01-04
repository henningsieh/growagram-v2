// src/app/[locale]/(protected)/users/[id]/form/page.tsx:
import { notFound } from "next/navigation";
import AccountEditForm from "~/components/features/Account/account-edit-form";
import { api } from "~/lib/trpc/server";
import { GetUserByIdInput, GetUserEditInput } from "~/server/api/root";

export default async function EditUserPage({
  params,
}: {
  params: Promise<GetUserEditInput>;
}) {
  // Get the current user's profile
  const user = await api.users.getById({
    id: (await params).id,
  } satisfies GetUserByIdInput);

  // If user not found, show 404
  if (!user) notFound();

  return <AccountEditForm user={user} />;
}
