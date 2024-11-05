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

export function NavigationBreadcrumb() {
  const pathname = usePathname();
  const currentNav = findCurrentNavItem(pathname, sidebarItems.navMain);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Platform</Link>
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
