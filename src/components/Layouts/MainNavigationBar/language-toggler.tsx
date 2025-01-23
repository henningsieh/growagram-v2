"use client";

// src/components/Layouts/MainNavigationBar/language-toggler.tsx:
import { LanguagesIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useParams } from "next/navigation";
import { APP_SETTINGS } from "~/assets/constants";
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
  const pathname = usePathname();
  const params = useParams();
  const t = useTranslations("LanguageToggle");

  const languages = APP_SETTINGS.LANGUAGES.map((language) => ({
    ...language,
    flag: (
      <Image
        width={24}
        height={20}
        className="h-5 w-6"
        src={language.flag}
        alt={`${language.label} flag`}
      />
    ),
  }));

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
          title={t("toggle-language")}
        >
          <LanguagesIcon size={24} strokeWidth={1.6} />
          <span className="sr-only">{t("toggle-language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
          >
            <div className="flex w-full items-start">
              <div className="mr-2">{language.flag}</div>
              <div>{language.label}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
