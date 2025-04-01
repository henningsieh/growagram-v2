"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { ComputerIcon, MoonIcon, SunIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function ThemeToggle() {
  const t = useTranslations("ThemeToggler");

  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          aria-haspopup="menu"
          title={t("toggle-theme")}
        >
          <SunIcon
            strokeWidth={2.4}
            className="size-6 scale-100 dark:scale-0"
          />
          <MoonIcon
            strokeWidth={2.4}
            className="absolute size-6 scale-0 dark:scale-100"
          />
          <span className="sr-only">{t("toggle-theme")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <SunIcon className="mr-1" />
          {t("light")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <MoonIcon className="mr-1" />
          {t("dark")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <ComputerIcon className="mr-1" />
          {t("system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
