import React from "react";

export default function FormGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  );
}
