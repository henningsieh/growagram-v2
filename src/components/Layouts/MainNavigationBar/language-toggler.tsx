"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useParams } from "next/navigation";
import { LanguagesIcon } from "lucide-react";
import { APP_SETTINGS } from "~/assets/constants";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { usePathname, useRouter } from "~/lib/i18n/routing";

// Use URL imports for flags instead of direct SVG imports
const FLAG_IMAGES = {
  de: "/flags/germany-flag.svg",
  en: "/flags/us-flag.svg",
};

export function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const t = useTranslations("Platform");

  const handleLanguageChange = (newLocale: string) => {
    const newPath = { pathname, params };
    router.replace(newPath, { locale: newLocale });
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-haspopup="menu"
          title={t("LanguageToggle.toggle-language")}
          className="p-0"
        >
          <LanguagesIcon strokeWidth={1.8} className="size-6" />
          <span className="sr-only">{t("LanguageToggle.toggle-language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {APP_SETTINGS.LANGUAGES.map((language) => {
          const flagSrc = FLAG_IMAGES[language.code];

          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
            >
              <div className="flex w-full items-start">
                <div className="relative mr-2 h-5 w-6">
                  {flagSrc && (
                    <Image
                      src={flagSrc}
                      alt={`${language.label} flag`}
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  )}
                </div>
                <div>{language.label}</div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
