"use client";

import { LanguagesIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useParams } from "next/navigation";
import DEFlag from "~/assets/flags/germany-svgrepo-com.svg";
import USFlag from "~/assets/flags/united-states-svgrepo-com.svg";
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
      flag: (
        <Image
          width={24}
          height={20}
          className="h-5 w-6"
          src={DEFlag}
          alt="German flag"
        />
      ),
    },
    {
      code: "en",
      label: "English",
      flag: (
        <Image
          width={24}
          height={20}
          className="h-5 w-6"
          src={USFlag}
          alt="UK flag"
        />
      ),
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
