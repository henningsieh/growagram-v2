// src/app/[locale]/(protected)/account/page.tsx:
import { BreadcrumbSetter } from "~/components/Layouts/Breadcrumbs/breadcrumb-setter";
import AccountInfo from "~/components/features/Account/account-info";

import type { GetOwnUserDataType } from "~/server/api/root";

import { auth } from "~/lib/auth";
import { createBreadcrumbs } from "~/lib/breadcrumbs/breadcrumbs";

import { modulePaths } from "~/assets/constants";

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
