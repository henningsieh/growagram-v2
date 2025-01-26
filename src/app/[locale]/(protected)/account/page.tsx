// src/app/[locale]/(protected)/account/page.tsx:
import AccountInfo from "~/components/features/Account/account-info";
import { auth } from "~/lib/auth";
import type { GetOwnUserDataType } from "~/server/api/root";

export default async function AccountPage() {
  const session = await auth();
  const user = session?.user as GetOwnUserDataType;

  return user && <AccountInfo user={user} />;
}
