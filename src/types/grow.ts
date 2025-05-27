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
  HYDROPONIC = "hydroponic",
}

// Culture medium types for filtering
export enum CultureMedium {
  SOIL = "soil",
  COCO = "coco",
  HYDRO = "hydro",
  ROCKWOOL = "rockwool",
  PERLITE = "perlite",
  VERMICULITE = "vermiculite",
}

// Fertilizer types for filtering
export enum FertilizerType {
  ORGANIC = "organic",
  SYNTHETIC = "synthetic",
  LIQUID = "liquid",
  GRANULAR = "granular",
  SLOW_RELEASE = "slow_release",
}
