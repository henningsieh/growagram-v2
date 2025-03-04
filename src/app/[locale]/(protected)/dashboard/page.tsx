// src/app/[locale]/(protected)/dashboard/layout.tsx:
import { DashboardContent } from "~/components/features/Dashboard/dashboard-content";

export const metadata = {
  title: "Grower's Plattform",
  description: "Grower's Plattform",
};

export default async function Dashboard() {
  return <DashboardContent />;
}
