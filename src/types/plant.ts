// src/types/plant.ts:
import {
  Flower,
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
    icon: Flower,
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

// Use the order of PlantGrowthStages as our single source of truth for sequence
export const orderedPhases: GrowthPhase[] = PlantGrowthStages.map(
  (s) => s.name,
);

export const getGrowthStage = (name: GrowthPhase): GrowthStage => {
  const stage = PlantGrowthStages.find((s) => s.name === name);
  if (!stage) throw new Error(`Invalid growth stage: ${name}`);
  return stage;
};

/**
 * Builds the growth phases object for a plant
 * @param plant The plant object with phase dates
 * @returns A record mapping each growth phase to its date and stage
 */
export function buildPlantGrowthPhases(plant: {
  startDate?: Date | null;
  seedlingPhaseStart?: Date | null;
  vegetationPhaseStart?: Date | null;
  floweringPhaseStart?: Date | null;
  harvestDate?: Date | null;
  curingPhaseStart?: Date | null;
}): Record<GrowthPhase, { date: Date | null; stage: GrowthStage }> {
  return {
    planted: {
      date: plant.startDate || null,
      stage: getGrowthStage("planted"),
    },
    seedling: {
      date: plant.seedlingPhaseStart || null,
      stage: getGrowthStage("seedling"),
    },
    vegetation: {
      date: plant.vegetationPhaseStart || null,
      stage: getGrowthStage("vegetation"),
    },
    flowering: {
      date: plant.floweringPhaseStart || null,
      stage: getGrowthStage("flowering"),
    },
    harvested: {
      date: plant.harvestDate || null,
      stage: getGrowthStage("harvested"),
    },
    curing: {
      date: plant.curingPhaseStart || null,
      stage: getGrowthStage("curing"),
    },
  };
}
