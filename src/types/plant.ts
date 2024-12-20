// src/types/plant.ts:

type GrowthStage = {
  name: string;
  color: string;
  typical_duration?: number; // Duration in weeks
};

export const PlantGrowthStages: GrowthStage[] = [
  { name: "planted", color: "planted", typical_duration: 0 },
  { name: "seedling", color: "seedling", typical_duration: 2 },
  { name: "vegetation", color: "vegetation", typical_duration: 4 },
  { name: "flowering", color: "flowering", typical_duration: 8 },
  { name: "harvest", color: "harvest", typical_duration: 0 }, // Timestamp, not a duration
  { name: "curing", color: "curing", typical_duration: 0 }, // Not part of growth calculation
];
