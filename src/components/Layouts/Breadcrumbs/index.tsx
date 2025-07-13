"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { useBreadcrumbs } from "~/lib/breadcrumbs/breadcrumb-context";
import { Link } from "~/lib/i18n/routing";

interface NavigationBreadcrumbProps {
  className?: string;
}

export function NavigationBreadcrumbs({
  className,
}: NavigationBreadcrumbProps) {
  const t = useTranslations();
  const { items: breadcrumbs } = useBreadcrumbs();

  // If there are no items, render a simple text for debugging
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return (
      <span className="text-xs text-red-500">
        {t("Platform.No breadcrumbs available")}
      </span>
    );
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList className="text-sm font-semibold">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const label = t(item.translationKey);

          return (
            <React.Fragment key={item.path}>
              <BreadcrumbItem
                className={index === 0 ? "hidden md:block" : undefined}
              >
                {item.isCurrentPage || isLast ? (
                  <BreadcrumbPage className="text-lg font-semibold">
                    {label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild className="text-lg font-semibold">
                    <Link href={item.path}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator
                  className={index === 0 ? "hidden md:block" : undefined}
                />
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
