// src/app/[locale]/(protected)/account/edit/page.tsx:
import AccountEditForm from "~/components/features/Account/account-edit-form";
import { auth } from "~/lib/auth";
import type { GetOwnUserDataType } from "~/server/api/root";

export default async function AccountEditPage() {
  const session = await auth();
  const user = session?.user as GetOwnUserDataType;

  return user && <AccountEditForm user={user} />;
}
