import { useTranslations } from "next-intl";
import { BeanIcon, Dna, FlaskConical } from "lucide-react";
import {
  HybridTooltip,
  HybridTooltipContent,
  HybridTooltipTrigger,
} from "~/components/atom/hybrid-tooltip";
import { Badge } from "~/components/ui/badge";
import { StrainType } from "~/server/api/root";

export default function StrainBadge({ strain }: { strain: StrainType }) {
  const t = useTranslations("Plants");

  return (
    <div className="flex items-center justify-end gap-4">
      {strain && (
        <HybridTooltip>
          <HybridTooltipTrigger className="cursor-help">
            <Badge variant="strain" className="ml-auto flex items-center gap-1">
              <BeanIcon className="h-3.5 w-3.5" />
              <span>{strain.name}</span>
            </Badge>
          </HybridTooltipTrigger>
          <HybridTooltipContent className="text-seedling">
            <div className="space-y-2 p-1">
              <div className="flex items-center gap-2">
                <Dna className="h-4 w-4" />
                <span>
                  {t("breeder")}
                  {": "}
                  {strain.breeder.name}
                </span>
              </div>
              {strain.thcContent && (
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4" />
                  <span>
                    {t("thc-content")}
                    {": "}
                    {strain.thcContent}
                    {"%"}
                  </span>
                </div>
              )}
            </div>
          </HybridTooltipContent>
        </HybridTooltip>
      )}
    </div>
  );
}
