"use client";

import { useEffect } from "react";
import { useBreadcrumbs } from "~/components/Layouts/Breadcrumbs/breadcrumb-context";
import { BreadcrumbsType } from "~/lib/breadcrumbs";

export function BreadcrumbSetter({ items }: { items: BreadcrumbsType }) {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs(items);
    // Reset breadcrumbs on unmount
    return () => setBreadcrumbs([]);
  }, [items, setBreadcrumbs]);

  return null;
}
