// src/lib/sidebar/index.ts:
import * as Icons from "lucide-react";
import sidebarJsonData from "~/lib/sidebar/data.json";
import {
  IconComponent,
  IconType,
  ProcessedNavItem,
  ProcessedSidebarItems,
} from "~/types/sidebar";

// Helper function to convert icon strings to actual Lucide components
function getIconComponent(iconName: string): IconComponent {
  if (!(iconName in Icons)) {
    throw new Error(`Icon ${iconName} not found in Lucide icons`);
  }
  return Icons[iconName as IconType] as IconComponent;
}

// Process the JSON config to convert icon strings to components
function getSidebarItems(): ProcessedSidebarItems {
  return {
    ...sidebarJsonData,
    teams: sidebarJsonData.teams.map((team) => ({
      ...team,
      logo: getIconComponent(team.logo),
    })),
    navMain: sidebarJsonData.navMain.map((item) => ({
      ...item,
      icon: item.icon ? getIconComponent(item.icon) : undefined,
    })),
    coming_soon: sidebarJsonData.coming_soon.map((cs) => ({
      ...cs,
      icon: getIconComponent(cs.icon),
    })),
  };
}

// Export the processed sidebar items
export const sidebarItems = getSidebarItems();

// Helper function to find the current navigation item
export function findCurrentNavItem(path: string, navItems: ProcessedNavItem[]) {
  for (const item of navItems) {
    const subItem = item.items?.find((subItem) => subItem.url === path);
    if (subItem) {
      return { main: item, sub: subItem };
    }
  }
  return null;
}

// Export the type for the nav items (replacing PlatformSidebarItems)
export type PlatformSidebarItems = ProcessedNavItem[];
