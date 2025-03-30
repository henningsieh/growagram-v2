"use client";

// src/app/[locale]/(protected)/account/edit/page.tsx:
import { useSession } from "next-auth/react";
import AccountEditForm from "~/components/features/Account/account-edit-form";
import type { GetOwnUserDataType } from "~/server/api/root";

export default function AccountEditPage() {
  const { data: session } = useSession();

  const user = session?.user as GetOwnUserDataType;

  return user && <AccountEditForm user={user} />;
}
