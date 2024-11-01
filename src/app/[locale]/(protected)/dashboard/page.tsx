"use client";

import { UserProfile } from "~/components/features/UserProfile";
import { useAuthUser } from "~/hooks/use-authentication";

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuthUser();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not authenticated</div>;

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20">
      <UserProfile user={user} />
    </div>
  );
}
