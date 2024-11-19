import React from "react";

export default function FormContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="mx-auto max-w-3xl">{children}</div>;
}
