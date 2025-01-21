import React from "react";
import { Link } from "~/lib/i18n/routing";

const AppFooter = () => {
  return (
    <footer className="border-t py-4">
      <div className="container flex items-center justify-between px-4">
        <span className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} GrowAGram, a project from{" "}
          <a
            href="https://henningsieh.de/impressum"
            className="hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            Henning Sieh
          </a>
        </span>
        <Link
          href="/app/status"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Development Status
        </Link>
      </div>
    </footer>
  );
};

export default AppFooter;
