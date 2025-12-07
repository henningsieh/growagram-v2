// src/app/[locale]/(protected)/users/[id]/form/page.tsx:
import { notFound } from "next/navigation";

import AccountEditForm from "~/components/features/Account/account-edit-form";

import { GetOwnUserDataType } from "~/server/api/root";

import { caller } from "~/lib/trpc/server";

export default async function EditUserPage() {
  // Get the current user's profile
  const user =
    (await caller.users.getOwnUserData()) satisfies GetOwnUserDataType;

  // If user not found, show 404
  if (!user) notFound();

  return <AccountEditForm user={user} />;
}
