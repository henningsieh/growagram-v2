// src/lib/sidebar/index.ts:
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

// ...existing code...

type TranslationFunction = (key: string) => string;

interface SidebarTeam {
  name: string;
  logo: LucideIcon;
  plan: string;
}

interface SidebarSubItem {
  title: string;
  url: string;
}

interface SidebarNavItem {
  title: string;
  icon?: LucideIcon;
  url?: string;
  items?: SidebarSubItem[];
  isActive?: boolean;
}

interface ComingSoonItem {
  name: string;
  icon: LucideIcon;
}

interface SidebarItems {
  teams: SidebarTeam[];
  navMain: SidebarNavItem[];
  coming_soon: ComingSoonItem[];
}

export function translateSidebar(
  t: TranslationFunction,
  items: SidebarItems,
  options: {
    teamPrefix?: string;
    navPrefix?: string;
    comingSoonPrefix?: string;
  } = {
    teamPrefix: "Sidebar.teams",
    navPrefix: "Sidebar.navMain",
    comingSoonPrefix: "Sidebar.coming_soon",
  },
) {
  const { teamPrefix, navPrefix, comingSoonPrefix } = options;

  return {
    ...items,
    teams: items.teams.map((team) => ({
      ...team,
      name: t(`${teamPrefix}.${team.name}`),
      plan: t(`${teamPrefix}.${team.plan}`),
    })),
    navMain: items.navMain.map((item) => ({
      ...item,
      title: t(`${navPrefix}.${item.title}.title`),
      items: item.items?.map((subItem) => ({
        ...subItem,
        title: t(`${navPrefix}.${item.title}.items.${subItem.title}`),
      })),
    })),
    coming_soon: items.coming_soon.map((cs) => ({
      ...cs,
      name: t(`${comingSoonPrefix}.${cs.name}`),
    })),
  };
}
