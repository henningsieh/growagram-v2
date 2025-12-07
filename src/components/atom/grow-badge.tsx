import { TentTreeIcon } from "lucide-react";

import { Badge } from "~/components/ui/badge";

import { PlantGrowType } from "~/server/api/root";

import { Link } from "~/lib/i18n/routing";

import { modulePaths } from "~/assets/constants";

/**
 * GrowBadge Component
 *
 * @description A reusable badge component that displays grow information with a link to the grow details page.
 * Unlike StrainBadge, this component acts as a clickable link button without tooltip functionality.
 *
 * @param grow - The grow object containing id and name
 * @returns JSX element with grow badge link
 *
 * @example
 * ```tsx
 * <GrowBadge grow={plant.grow} />
 * ```
 */

export default function GrowBadge({ grow }: { grow: PlantGrowType }) {
  return (
    <div className="flex flex-wrap gap-2 p-0">
      <Link href={`${modulePaths.PUBLICGROWS.path}/${grow.id}`}>
        <Badge
          variant="grow"
          className="flex max-w-32 items-center gap-1 overflow-hidden rounded-sm text-ellipsis whitespace-nowrap [&>svg]:size-4"
        >
          <TentTreeIcon className="shrink-0" />
          <span className="overflow-hidden text-ellipsis">{grow.name}</span>
        </Badge>
      </Link>
    </div>
  );
}
