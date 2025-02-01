// src/app/[locale]/(protected)/dashboard/layout.tsx:
import { DashboardContent } from "~/components/features/Dashboard/dashboard-content";
import { auth } from "~/lib/auth";
import { type User } from "~/lib/db/types";

export const metadata = {
  title: "Grower's Plattform",
  description: "Grower's Plattform",
};

export default async function Dashboard() {
  const session = await auth();
  const user = session?.user as User;

  return <DashboardContent user={user} />;
}
