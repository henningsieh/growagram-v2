"use client";

import * as React from "react";

export type BreadcrumbItem = {
  translationKey: string;
  path: string;
  isCurrentPage?: boolean;
};

type BreadcrumbContextType = {
  items: BreadcrumbItem[];
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
};

const BreadcrumbContext = React.createContext<
  BreadcrumbContextType | undefined
>(undefined);

export function BreadcrumbProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = React.useState<BreadcrumbItem[]>([]);

  const setBreadcrumbs = (newItems: BreadcrumbItem[]) => {
    setItems(newItems);
  };

  return (
    <BreadcrumbContext.Provider value={{ items, setBreadcrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbs() {
  const context = React.useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error("useBreadcrumbs must be used within a BreadcrumbProvider");
  }
  return context;
}
