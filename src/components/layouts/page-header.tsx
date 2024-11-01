import React from "react";

interface IPageHeader {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function PageHeader({ title, subtitle, children }: IPageHeader) {
  return (
    <div className="container mx-auto space-y-8 pt-4">
      <div className="flex flex-col space-y-2">
        <div className="text-2xl font-bold sm:text-4xl md:text-5xl">
          {title}
        </div>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
