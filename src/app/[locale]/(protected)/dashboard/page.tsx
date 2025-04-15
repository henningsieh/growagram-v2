// src/app/[locale]/(protected)/dashboard/page.tsx:
import { BreadcrumbSetter } from "~/components/Layouts/Breadcrumbs/breadcrumb-setter";
import { DashboardContent } from "~/components/features/Dashboard/dashboard-content";
import { createBreadcrumbs } from "~/lib/breadcrumbs/breadcrumbs";

export const metadata = {
  title: "Grower's Plattform",
  description: "Grower's Plattform",
};

export default function Dashboard() {
  // For the dashboard page, we pass an empty array to get just the dashboard breadcrumb marked as current
  const breadcrumbs = createBreadcrumbs([]);

  return (
    <>
      <BreadcrumbSetter items={breadcrumbs} />
      <DashboardContent />
    </>
  );
}
