// src/app/[locale]/(protected)/account/page.tsx:
import { modulePaths } from "~/assets/constants";
import { BreadcrumbSetter } from "~/components/Layouts/Breadcrumbs/breadcrumb-setter";
import AccountInfo from "~/components/features/Account/account-info";
import { auth } from "~/lib/auth";
import { createBreadcrumbs } from "~/lib/breadcrumbs/breadcrumbs";
import type { GetOwnUserDataType } from "~/server/api/root";

export default async function AccountPage() {
  const session = await auth();
  const user = session?.user as GetOwnUserDataType;

  // Create breadcrumbs for this page using sidebar translation keys
  const breadcrumbs = createBreadcrumbs([
    {
      translationKey: "Account.account-info-title",
      path: modulePaths.ACCOUNT.path,
    },
  ]);

  return (
    <>
      <BreadcrumbSetter items={breadcrumbs} />
      {user && <AccountInfo user={user} />}
    </>
  );
}
