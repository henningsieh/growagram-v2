"use client";

import { LanguagesIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useParams } from "next/navigation";
import DEFlag from "~/assets/flags/Flag_of_Germany-64x38.png";
import USFlag from "~/assets/flags/Flag_of_United_States-64x34.png";
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

  const languages = [
    {
      code: "de",
      label: "Deutsch",
      flag: <Image className="h-[11] w-5" src={DEFlag} alt="German flag" />,
    },
    {
      code: "en",
      label: "English",
      flag: <Image className="h-[11] w-5" src={USFlag} alt="UK flag" />,
    },
  ];

  const handleLanguageChange = (newLocale: string) => {
    const newPath = { pathname, params };
    router.replace(newPath, { locale: newLocale });
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
          <LanguagesIcon size={20} strokeWidth={1.6} />
          <span className="sr-only">{t("toggle-language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
          >
            <div className="flex w-full items-center">
              <div className="mr-3 flex-shrink-0">{language.flag}</div>
              <span>{language.label}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
