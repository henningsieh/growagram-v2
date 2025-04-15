import { modulePaths } from "~/assets/constants";
import type { BreadcrumbItem } from "~/lib/breadcrumbs/breadcrumb-context";

// Helper to create breadcrumbs with translation keys
export function createBreadcrumbs(
  items: Array<Omit<BreadcrumbItem, "isCurrentPage">>,
): BreadcrumbItem[] {
  // Always start with dashboard
  const defaultItems: BreadcrumbItem[] = [
    {
      translationKey: "Platform.Dashboard-title",
      path: modulePaths.DASHBOARD.path,
      isCurrentPage: false,
    },
  ];

  // Add provided items, marking the last one as current
  const breadcrumbs = [
    ...defaultItems,
    ...items.map((item, index) => ({
      ...item,
      isCurrentPage: index === items.length - 1,
    })),
  ];

  return breadcrumbs;
}

export type BreadcrumbsType = ReturnType<typeof createBreadcrumbs>;
