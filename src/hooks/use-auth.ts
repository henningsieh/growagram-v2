"use client";

// src/hooks/useAuth.ts
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useSignOut() {
  const router = useRouter();

  return async () => {
    await signOut({ redirect: false });
    router.push("/");
  };
}
