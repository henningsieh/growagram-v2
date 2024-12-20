// src/lib/utils/calculateDetailedGrowthProgress.ts:
import { GetOwnPlantType } from "~/server/api/root";
import { PlantGrowthStages } from "~/types/plant";

// Get total weeks for active growth phases (seedling through flowering)
// Hey Claude AI, this seems not to be needed!?
const TOTAL_GROWTH_WEEKS = PlantGrowthStages.reduce(
  (total, stage) => total + (stage.typical_duration || 0),
  0,
);

interface PhaseProgress {
  currentPhase:
    | "planted"
    | "seedling"
    | "vegetation"
    | "flowering"
    | "harvested";
  overallProgress: number;
  phaseProgress: number;
  estimatedHarvestDate: Date | null;
  daysUntilNextPhase: number | null;
  nextPhase: string | null;
}

export function calculateDetailedGrowthProgress(
  plant: GetOwnPlantType,
): PhaseProgress {
  const now = new Date();

  const getWeeksBetween = (start: Date, end: Date): number => {
    const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    return (end.getTime() - start.getTime()) / millisecondsPerWeek;
  };

  const getDaysBetween = (start: Date, end: Date): number => {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.ceil((end.getTime() - start.getTime()) / millisecondsPerDay);
  };

  const progress: PhaseProgress = {
    currentPhase: "planted",
    overallProgress: 0,
    phaseProgress: 0,
    estimatedHarvestDate: null,
    daysUntilNextPhase: null,
    nextPhase: null,
  };

  if (plant.harvestDate) {
    return {
      currentPhase: "harvested",
      overallProgress: 100,
      phaseProgress: 100,
      estimatedHarvestDate: null,
      daysUntilNextPhase: null,
      nextPhase: null,
    };
  }

  if (plant.floweringPhaseStart) {
    const floweringStage = PlantGrowthStages.find(
      (stage) => stage.name === "flowering",
    )!;
    progress.currentPhase = "flowering";
    const floweringWeeks = getWeeksBetween(plant.floweringPhaseStart, now);
    progress.phaseProgress = Math.min(
      100,
      (floweringWeeks / floweringStage.typical_duration!) * 100,
    );
    progress.overallProgress =
      60 + (floweringWeeks / floweringStage.typical_duration!) * 40;
    progress.nextPhase = "harvest";
    progress.daysUntilNextPhase =
      floweringStage.typical_duration! * 7 -
      getDaysBetween(plant.floweringPhaseStart, now);

    const harvestDate = new Date(plant.floweringPhaseStart);
    harvestDate.setDate(
      harvestDate.getDate() + floweringStage.typical_duration! * 7,
    );
    progress.estimatedHarvestDate = harvestDate;
  } else if (plant.vegetationPhaseStart) {
    const vegetationStage = PlantGrowthStages.find(
      (stage) => stage.name === "vegetation",
    )!;
    progress.currentPhase = "vegetation";
    const vegetationWeeks = getWeeksBetween(plant.vegetationPhaseStart, now);
    progress.phaseProgress = Math.min(
      100,
      (vegetationWeeks / vegetationStage.typical_duration!) * 100,
    );
    progress.overallProgress =
      30 + (vegetationWeeks / vegetationStage.typical_duration!) * 30;
    progress.nextPhase = "flowering";
    progress.daysUntilNextPhase =
      vegetationStage.typical_duration! * 7 -
      getDaysBetween(plant.vegetationPhaseStart, now);
  } else if (plant.seedlingPhaseStart) {
    const seedlingStage = PlantGrowthStages.find(
      (stage) => stage.name === "seedling",
    )!;
    progress.currentPhase = "seedling";
    const seedlingWeeks = getWeeksBetween(plant.seedlingPhaseStart, now);
    progress.phaseProgress = Math.min(
      100,
      (seedlingWeeks / seedlingStage.typical_duration!) * 100,
    );
    progress.overallProgress =
      (seedlingWeeks / seedlingStage.typical_duration!) * 30;
    progress.nextPhase = "vegetation";
    progress.daysUntilNextPhase =
      seedlingStage.typical_duration! * 7 -
      getDaysBetween(plant.seedlingPhaseStart, now);
  }

  progress.overallProgress = Math.min(
    100,
    Math.max(0, Math.round(progress.overallProgress)),
  );
  progress.phaseProgress = Math.min(
    100,
    Math.max(0, Math.round(progress.phaseProgress)),
  );

  return progress;
}
