// src/lib/navigation/index.ts
import type { NavigationData, NavigationItem } from "~/types/navigation";

import navigationData from "~/lib/navigation/data.json";
import { getIconComponent } from "~/lib/utils/icons";

export function getProcessedNavigationData() {
  return {
    ...navigationData,
    navigationItems: navigationData.navigationItems.map((item) => ({
      ...item,
      content: item.content && {
        ...item.content,
        featured: item.content.featured && {
          ...item.content.featured,
          icon: item.content.featured.icon
            ? getIconComponent(item.content.featured.icon)
            : undefined,
        },
        items: item.content.items?.map((subItem) => ({
          ...subItem,
          icon: subItem.icon ? getIconComponent(subItem.icon) : undefined,
        })),
      },
    })),
  };
}

export const processedNavigation = getProcessedNavigationData();
export type { NavigationData, NavigationItem };
