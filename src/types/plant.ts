// src/types/plant.ts:

export enum PlantsSortField {
  NAME = "name",
  CREATED_AT = "createdAt",
}

export enum PlantsViewMode {
  PAGINATION = "pagination",
  INFINITE_SCROLL = "infinite-scroll",
}

export type GrowthStage = {
  name: string;
  color: string;
  typical_duration?: number;
};

export const PlantGrowthStages = [
  { name: "planted", color: "planted", typical_duration: 1 },
  { name: "seedling", color: "seedling", typical_duration: 2 },
  { name: "vegetation", color: "vegetation", typical_duration: 6 },
  { name: "flowering", color: "flowering", typical_duration: 10 },
  { name: "harvested", color: "harvest", typical_duration: 0 },
  { name: "curing", color: "curing", typical_duration: Infinity },
] as const;

// Infer the phase names from PlantGrowthStages
export type GrowthPhase = (typeof PlantGrowthStages)[number]["name"];
