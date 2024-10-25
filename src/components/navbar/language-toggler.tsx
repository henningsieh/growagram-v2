"use client";

import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import DEFlag from "~/assets/flags/de.svg";
import UKFlag from "~/assets/flags/us.svg";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { usePathname, useRouter } from "~/lib/i18n/routing";

export function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname(); // Get the current pathname
  const params = useParams(); // Get URL parameters if needed
  const t = useTranslations("LanguageToggler");

  const languages = [
    {
      code: "en",
      label: "English",
      flag: <UKFlag className="h-4 w-6" />,
    },
    {
      code: "de",
      label: "Deutsch",
      flag: <DEFlag className="h-4 w-6" />,
    },
  ];

  const handleLanguageChange = (newLocale: string) => {
    // Create the new path with the new locale and keep other params intact
    const newPath = { pathname, params };

    // Use the router to replace the current path with the new one
    router.replace(newPath, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 px-0">
          <Globe className="h-4 w-4" />
          <span className="sr-only">{t("toggle-language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="cursor-pointer"
          >
            {language.flag}
            {language.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
