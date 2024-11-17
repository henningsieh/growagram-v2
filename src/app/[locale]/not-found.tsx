"use client";

// src/app/not-found.tsx:
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();

  return (
    <html>
      <body>
        <div>
          <h2>404 - Page Not Found</h2>
          <h2>Not Found: {pathname}</h2>
          <p>The page you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </body>
    </html>
  );
}
