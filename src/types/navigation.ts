import type { IconComponent } from "./icons";

// Raw types (for JSON data)
export type NavigationItem = {
  title: string;
  href?: string;
  type?: string;
  icon?: string;
  content?: {
    featured?: {
      title: string;
      href: string;
      description: string;
      icon?: string;
    };
    items?: Array<{
      title: string;
      href: string;
      description: string;
      icon?: string;
    }>;
  };
};

// Processed types (after icon conversion)
export interface ProcessedNavigationItem {
  title: string;
  href?: string;
  type?: string;
  icon?: IconComponent;
  content?: {
    featured?: {
      title: string;
      href: string;
      description: string;
      icon?: IconComponent;
    };
    items?: Array<{
      title: string;
      href: string;
      description: string;
      icon?: IconComponent;
    }>;
  };
}

export type NavigationData = {
  navigationItems: NavigationItem[];
};

export type ProcessedNavigationData = {
  navigationItems: ProcessedNavigationItem[];
};
