"use client";

// src/hooks/useAuth.ts
import { signOut } from "next-auth/react";

import { useRouter } from "~/lib/i18n/routing";

export function useSignOut() {
  const router = useRouter();

  return async () => {
    await signOut({ redirect: false });
    router.push("/");
  };
}
