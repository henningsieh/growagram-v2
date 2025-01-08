import { useTranslations } from "next-intl";
import { modulePaths } from "~/assets/constants";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Link, usePathname } from "~/lib/i18n/routing";
import { findCurrentNavItem, sidebarItems } from "~/lib/sidebar";

interface NavigationBreadcrumbProps {
  className?: string;
}

export function NavigationBreadcrumb({ className }: NavigationBreadcrumbProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const currentNav = findCurrentNavItem(pathname, sidebarItems.navMain);
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link href={modulePaths.DASHBOARD.path}>
              {t("Platform.Dashboard-title")}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        {currentNav && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={currentNav.main.url || "#"}>
                  {currentNav.main.title}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentNav.sub.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
