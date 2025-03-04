import {
  Flower2,
  Leaf,
  type LucideIcon,
  Nut,
  PillBottle,
  Sprout,
  Wheat,
} from "lucide-react";

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
  weight?: number; // Added: weight for overall progress calculation
  icon: LucideIcon; // Added: icon for phase representation
};

export const PlantGrowthStages = [
  {
    name: "planted",
    color: "planted",
    typical_duration: 1,
    weight: 5,
    icon: Nut,
  },
  {
    name: "seedling",
    color: "seedling",
    typical_duration: 2,
    weight: 15,
    icon: Sprout,
  },
  {
    name: "vegetation",
    color: "vegetation",
    typical_duration: 6,
    weight: 30,
    icon: Leaf,
  },
  {
    name: "flowering",
    color: "flowering",
    typical_duration: 10,
    weight: 50,
    icon: Flower2,
  },
  {
    name: "harvested",
    color: "harvest",
    typical_duration: 0,
    weight: 0,
    icon: Wheat,
  },
  {
    name: "curing",
    color: "curing",
    typical_duration: Infinity,
    weight: 0,
    icon: PillBottle,
  },
] as const;

// Infer the phase names from PlantGrowthStages
export type GrowthPhase = (typeof PlantGrowthStages)[number]["name"];
