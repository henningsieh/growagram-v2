// src/app/[locale]/(protected)/dashboard/layout.tsx:
import { DashboardContent } from "~/components/features/Dashboard/dashboard-content";
import { auth } from "~/lib/auth";
import { type User } from "~/types/db";

export const metadata = {
  title: "Grower's dashboard",
  description: "Grower's dashboard",
};

export default async function Dashboard() {
  // auth() MUST be async
  const session = await auth();
  const user = session?.user as User;

  return <DashboardContent user={user} />;
}
