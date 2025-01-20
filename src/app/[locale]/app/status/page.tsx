import fs from "fs/promises";
import path from "path";
import React from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { Card } from "~/components/ui/card";

const MarkdownPage = async () => {
  const markdown = await fs.readFile(
    path.join(process.cwd(), "README.md"),
    "utf-8",
  );

  const components: Components = {
    h1: ({ children }) => (
      <h1 className="mb-4 text-4xl font-bold">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-4 mt-8 text-2xl font-semibold">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-6 text-xl font-semibold">{children}</h3>
    ),
    ul: ({ children }) => (
      <ul className="mb-4 list-inside list-disc">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-4 list-inside list-decimal">{children}</ol>
    ),
    li: ({ children }) => <li className="mb-1">{children}</li>,
    p: ({ children }) => {
      // Type-safe check for badges
      const childrenArray = React.Children.toArray(children);

      // Check if any child is an <a> element containing an img.shields.io image
      const hasBadges = childrenArray.some((child) => {
        if (React.isValidElement(child)) {
          const element = child as React.ReactElement;
          const aProps = element.props as { href?: string };
          return aProps.href?.includes("shields.io");
        }
        return false;
      });

      if (hasBadges) {
        return (
          <div className="mb-6 flex flex-wrap items-center gap-2 [&_img]:inline-block">
            {children}
          </div>
        );
      }

      return <p className="mb-4">{children}</p>;
    },
    a: ({ children, href }) => (
      <a
        className="inline-flex items-center text-blue-600 hover:underline dark:text-blue-400"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    code: ({ children, className }) => {
      const isInline = !className;
      return isInline ? (
        <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">
          {children}
        </code>
      ) : (
        <code className="my-4 block rounded bg-gray-100 p-4 dark:bg-gray-800">
          {children}
        </code>
      );
    },
    input: ({ type, checked }) => {
      if (type === "checkbox") {
        return (
          <input
            type="checkbox"
            className="mr-2 h-4 w-4 rounded border-gray-300"
            checked={checked || false}
            readOnly
          />
        );
      }
      return null;
    },
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold">README.md</h1>
      <Card className="mx-1 my-8 max-w-3xl p-8">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown components={components}>{markdown}</ReactMarkdown>
        </article>
      </Card>
    </div>
  );
};

export default MarkdownPage;
