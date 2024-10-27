// src/lib/navigation/types.ts
export type NavigationItem = {
  title: string;
  href?: string;
  type?: string;
  content?: {
    featured?: {
      title: string;
      href: string;
      description: string;
    };
    items?: Array<{
      title: string;
      href: string;
      description: string;
    }>;
  };
};

export type NavigationData = {
  navigationItems: NavigationItem[];
};
