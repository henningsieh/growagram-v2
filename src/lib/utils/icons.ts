import * as Icons from "lucide-react";

import type { IconComponent, IconType } from "~/types/icons";

export function getIconComponent(iconName: string): IconComponent {
  if (!(iconName in Icons)) {
    throw new Error(`Icon ${iconName} not found in Lucide icons`);
  }
  return Icons[iconName as IconType] as IconComponent;
}
