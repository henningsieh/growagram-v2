// src/assets/constants.ts:
import DEFlag from "~/assets/flags/germany-svgrepo-com.svg";
import USFlag from "~/assets/flags/united-states-svgrepo-com.svg";

export const PaginationItemsPerPage = {
  PHOTOS_PER_PAGE: 6,
  PLANTS_PER_PAGE: 6,
  GROWS_PER_PAGE: 6,
};

export const modulePaths = {
  DASHBOARD: {
    name: "Dashboard",
    path: "/dashboard",
    protected: true,
  },
  GROWS: {
    name: "Grows",
    path: "/grows",
    protected: true,
  },
  PLANTS: {
    name: "Plants",
    path: "/plants",
    protected: true,
  },
  PHOTOS: {
    name: "Photos",
    path: "/photos",
    protected: true,
  },
};

export const PROTECTED_PATHS = Object.values(modulePaths)
  .filter((module) => module.protected)
  .map((module) => module.path);

export const APP_SETTINGS = {
  DEFAULT_THEME: "light",
  DEFAULT_LOCALE: "de" as const,
  LANGUAGES: [
    {
      code: "de",
      label: "Deutsch",
      flag: DEFlag,
    },
    {
      code: "en",
      label: "English",
      flag: USFlag,
    },
  ] as const, // Ensures immutability and type inference
};
