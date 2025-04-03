"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar1Icon, TentTreeIcon } from "lucide-react";
import {
  HybridTooltip,
  HybridTooltipContent,
  HybridTooltipTrigger,
  TouchProvider,
} from "~/components/atom/hybrid-tooltip";
import { EnhancedPlantCard } from "~/components/features/Plants/enhanced-plant-card.tsx";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useIsMobile } from "~/hooks/use-mobile";
import { Link } from "~/lib/i18n/routing";
import { type DateFormatOptions, formatDate } from "~/lib/utils";
import type { GetAllGrowType } from "~/server/api/root";
import { Locale } from "~/types/locale";

interface EmbeddedGrowCardProps {
  grow: GetAllGrowType;
}

export function EmbeddedGrowCard({ grow }: EmbeddedGrowCardProps) {
  const locale = useLocale();
  const t = useTranslations();
  const isMobile = useIsMobile();
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <TouchProvider>
      <Card
        className="border-secondary/30 bg-secondary/05 gap-0 space-y-2 overflow-hidden rounded-md border p-2 pt-0 transition-all hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="p-0">
          <CardTitle as="h2" className="flex items-center justify-between">
            <Button
              asChild
              variant="link"
              className="text-secondary has-[>svg]:px-0"
            >
              <Link
                href={`/public/grows/${grow.id}`}
                className="items-center gap-2"
              >
                <TentTreeIcon size={20} />
                {grow.name}
              </Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="mt-2 space-y-2">
            {grow.plants.map((plant) => (
              <EnhancedPlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        </CardContent>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: isMobile ? 1 : isHovered ? 1 : 0.4 }}
            transition={{ duration: 0.3 }}
          >
            <CardFooter className="text-muted-foreground flex items-center justify-between p-0">
              <div className="text-muted-foreground flex justify-start text-xs">
                <HybridTooltip>
                  <HybridTooltipTrigger className="flex items-center gap-2">
                    <Calendar1Icon className="h-4 w-4 shrink-0" />
                    <span className="text-sm whitespace-nowrap">
                      {formatDate(
                        grow.createdAt,
                        locale as Locale,
                        {
                          includeYear: false,
                          force: true,
                        } as DateFormatOptions,
                      )}
                    </span>
                  </HybridTooltipTrigger>
                  <HybridTooltipContent>
                    <p>{t("Grows.grow-card-createdAt")}</p>
                  </HybridTooltipContent>
                </HybridTooltip>
              </div>
            </CardFooter>
          </motion.div>
        </AnimatePresence>
      </Card>
    </TouchProvider>
  );
}
