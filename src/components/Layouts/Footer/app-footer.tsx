// src/components/Layouts/Footer/app-footer.tsx:
import * as React from "react";

import { Link } from "~/lib/i18n/routing";

export const AppFooter = () => {
  return (
    <footer className="border-t py-4">
      <div className="flex items-center justify-between px-4">
        <span className="text-muted-foreground text-sm">
          {
            // eslint-disable-next-line react/jsx-no-literals
            `© ${new Date().getFullYear()} GrowAGram`
          }
        </span>
        <Link
          href="/app/status"
          className="text-muted-foreground hover:text-foreground text-sm"
          // eslint-disable-next-line react/jsx-no-literals
        >
          ReadMe / Development
        </Link>
      </div>
    </footer>
  );
};
