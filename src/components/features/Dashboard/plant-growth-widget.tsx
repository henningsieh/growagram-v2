import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Leaf, Sprout, Tag, TentTree, Wheat } from "lucide-react";
import { useLocale } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  HybridTooltip,
  HybridTooltipContent,
  HybridTooltipTrigger,
} from "~/components/ui/hybrid-tooltip";
import { Progress } from "~/components/ui/progress";
import { Link } from "~/lib/i18n/routing";
import { calculateGrowthProgress } from "~/lib/utils/calculateDetailedGrowthProgress";
import type { PlantByIdType } from "~/server/api/root";
import { Locale } from "~/types/locale";

interface PlantGrowthWidgetProps {
  plant: PlantByIdType;
}

export function PlantGrowthWidget({ plant }: PlantGrowthWidgetProps) {
  const locale = useLocale() as Locale;
  const progress = calculateGrowthProgress(plant);

  // Determine current phase icon
  let PhaseIcon = Sprout;
  if (plant.floweringPhaseStart) PhaseIcon = Tag;
  else if (plant.vegetationPhaseStart) PhaseIcon = Leaf;
  else if (plant.seedlingPhaseStart) PhaseIcon = Sprout;

  // Get first image URL if available
  const imageUrl =
    plant.plantImages?.[0]?.image?.imageUrl || plant.headerImage?.imageUrl;

  // Format days ago

  const startedAt = plant.startDate
    ? formatDistanceToNow(new Date(plant.startDate), {
        addSuffix: true,
        locale: locale === "de" ? de : undefined,
      })
    : "";

  return (
    <div className="flex items-center">
      <Link href={`/public/plants/${plant.id}`} className="block">
        <Avatar className="h-12 w-12">
          <AvatarImage src={imageUrl || ""} alt={plant.name} />
          <AvatarFallback>
            <PhaseIcon className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="ml-4 min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <Link
            href={`/public/plants/${plant.id}`}
            className="truncate text-sm font-medium hover:underline"
          >
            {plant.name}
          </Link>
          {plant.grow && (
            <HybridTooltip>
              <HybridTooltipTrigger>
                <Link
                  href={`/public/grows/${plant.grow.id}`}
                  className="text-muted-foreground"
                >
                  <TentTree className="h-4 w-4" />
                </Link>
              </HybridTooltipTrigger>
              <HybridTooltipContent>{plant.grow.name}</HybridTooltipContent>
            </HybridTooltip>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Progress value={progress.overallProgress} className="h-2 flex-1" />
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {progress.overallProgress}%
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{startedAt}</p>
      </div>
    </div>
  );
}
