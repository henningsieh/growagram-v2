// src/assets/constants.ts:
import DEFlag from "~/assets/flags/germany-svgrepo-com.svg";
import USFlag from "~/assets/flags/united-states-svgrepo-com.svg";

export const PaginationItemsPerPage = {
  PHOTOS_PER_PAGE: 6,
  PLANTS_PER_PAGE: 6,
  GROWS_PER_PAGE: 6,
  PUBLIC_GROWS_PER_PAGE: 2,
  PUBLIC_PLANTS_PER_PAGE: 2,
  MAX_DEFAULT_ITEMS: 1296,
};

export const modulePaths = {
  DASHBOARD: {
    name: "Dashboard",
    path: "/dashboard",
    protected: true,
  },
  PREMIUM: {
    name: "Premium",
    path: "/premium",
    protected: true,
  },
  ACCOUNT: {
    name: "Account",
    path: "/account",
    editPath: "/account/edit",
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
  PHOTOUPLOAD: {
    name: "Upload Photos",
    path: "/photos/upload",
    protected: true,
  },
  SIGNIN: {
    name: "Signin",
    path: "/signin",
    protected: false,
  },
  PUBLICTIMELINE: {
    name: "All Updates",
    path: "/public/timeline",
    protected: false,
  },
  PUBLICGROWS: {
    name: "All Grows",
    path: "/public/grows",
    protected: false,
  },
  PUBLICPLANTS: {
    name: "All Plants",
    path: "/public/plants",
    protected: false,
  },
  PUBLICPROFILE: {
    name: "Public Profile",
    path: "/public/profile",
    protected: false,
  },
  ADMINISTRATION: {
    name: "Administration",
    path: "/admin",
    protected: true,
  },
  USERADMINISTRATION: {
    name: "User Adminstration",
    path: "/admin/users",
    protected: true,
  },
};

export const PROTECTED_PATHS = Object.values(modulePaths)
  .filter((module) => module.protected)
  .map((module) => module.path);

export const APP_SETTINGS = {
  DEFAULT_THEME: "dark",
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

export const MAX_UPLOAD_FILE_SIZE = 10000000; // 10MB

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

export const TRPC_ENDPOINT = "/api/trpc";

// Ban duration options for admin user management
export const BAN_DURATIONS = [
  { value: "1d",    label: "1 day",     milliseconds:       24 * 60 * 60 * 1000 },
  { value: "3d",    label: "3 days",    milliseconds:   3 * 24 * 60 * 60 * 1000 },
  { value: "7d",    label: "1 week",    milliseconds:   7 * 24 * 60 * 60 * 1000 },
  { value: "14d",   label: "2 weeks",   milliseconds:  14 * 24 * 60 * 60 * 1000 },
  { value: "30d",   label: "1 month",   milliseconds:  30 * 24 * 60 * 60 * 1000 },
  { value: "90d",   label: "3 months",  milliseconds:  90 * 24 * 60 * 60 * 1000 },
  { value: "180d",  label: "6 months",  milliseconds: 180 * 24 * 60 * 60 * 1000 },
  { value: "365d",  label: "1 year",    milliseconds: 365 * 24 * 60 * 60 * 1000 },
  { value: "permanent", label: "Permanent", milliseconds: -1 },
];
