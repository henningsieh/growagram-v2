// src/types/grow.ts:

export enum GrowsSortField {
  NAME = "name",
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
}

export enum GrowsViewMode {
  PAGINATION = "pagination",
  INFINITE_SCROLL = "infinite-scroll",
}

// Grow environment types for filtering
export enum GrowEnvironment {
  INDOOR = "indoor",
  OUTDOOR = "outdoor",
  GREENHOUSE = "greenhouse",
}

// Culture medium types for filtering
export enum CultureMedium {
  SOIL = "soil",
  COCO = "coco",
  HYDROPONIC = "hydroponic",
  ROCKWOOL = "rockwool",
  PERLITE = "perlite",
}

// Fertilizer types for filtering
export enum FertilizerType {
  ORGANIC = "organic",
  MINERAL = "mineral",
}

// Fertilizer form/application method for filtering
export enum FertilizerForm {
  LIQUID = "liquid",
  GRANULAR = "granular",
  SLOW_RELEASE = "slow_release",
}

// Option arrays for form components
export const GROW_ENVIRONMENT_OPTIONS = [
  {
    value: GrowEnvironment.INDOOR,
    label: "Indoor",
    translationKey: "environment-indoor",
  },
  {
    value: GrowEnvironment.OUTDOOR,
    label: "Outdoor",
    translationKey: "environment-outdoor",
  },
  {
    value: GrowEnvironment.GREENHOUSE,
    label: "Greenhouse",
    translationKey: "environment-greenhouse",
  },
];

export const CULTURE_MEDIUM_OPTIONS = [
  {
    value: CultureMedium.SOIL,
    label: "Soil",
    translationKey: "culture-medium-soil",
  },
  {
    value: CultureMedium.COCO,
    label: "Coco",
    translationKey: "culture-medium-coco",
  },
  {
    value: CultureMedium.HYDROPONIC,
    label: "Hydroponic",
    translationKey: "culture-medium-hydro",
  },
  {
    value: CultureMedium.ROCKWOOL,
    label: "Rockwool",
    translationKey: "culture-medium-rockwool",
  },
  {
    value: CultureMedium.PERLITE,
    label: "Perlite",
    translationKey: "culture-medium-perlite",
  },
];

export const FERTILIZER_TYPE_OPTIONS = [
  {
    value: FertilizerType.ORGANIC,
    label: "Organic",
    translationKey: "fertilizer-type-organic",
  },
  {
    value: FertilizerType.MINERAL,
    label: "Mineral",
    translationKey: "fertilizer-type-mineral",
  },
];

export const FERTILIZER_FORM_OPTIONS = [
  {
    value: FertilizerForm.LIQUID,
    label: "Liquid",
    translationKey: "fertilizer-form-liquid",
  },
  {
    value: FertilizerForm.GRANULAR,
    label: "Granular",
    translationKey: "fertilizer-form-granular",
  },
  {
    value: FertilizerForm.SLOW_RELEASE,
    label: "Slow Release",
    translationKey: "fertilizer-form-slow_release",
  },
];
