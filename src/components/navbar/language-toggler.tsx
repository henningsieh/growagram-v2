import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import DEFlag from "~/assets/flags/de.svg";
import UKFlag from "~/assets/flags/us.svg";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { usePathname, useRouter } from "~/i18n/routing";

export function LanguageToogle() {
  const router = useRouter();
  const pathname = usePathname();

  const t = useTranslations("LanguageToggler");

  // These should match your configured locales in routing.ts

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
    // Get the current pathname without the locale prefix
    const pathWithoutLocale = pathname.replace(/^\/[^/]+/, "");

    // Navigate to the same path with new locale
    router.replace(pathWithoutLocale || "/", { locale: newLocale });
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
