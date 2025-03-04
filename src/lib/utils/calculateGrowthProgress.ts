import type { LucideIcon } from "lucide-react";
import { getDaysBetween, getWeeksBetween } from "~/lib/utils";
import type { GetOwnPlantType } from "~/server/api/root";
import {
  type GrowthPhase,
  type GrowthStage,
  PlantGrowthStages,
} from "~/types/plant";

interface CalculateGrowthProgressParameters {
  currentPhase: GrowthPhase;
  overallProgress: number;
  phaseProgress: number;
  estimatedHarvestDate: Date | null;
  daysUntilNextPhase: number | null;
  nextPhase: GrowthPhase | null;
  phaseIcon: LucideIcon;
}

export function calculateGrowthProgress(
  plant: GetOwnPlantType,
): CalculateGrowthProgressParameters {
  const now = new Date();

  const getGrowthStage = (name: GrowthPhase): GrowthStage => {
    const stage = PlantGrowthStages.find((s) => s.name === name);
    if (!stage) throw new Error(`Invalid growth stage: ${name}`);
    return stage;
  };

  // Handle harvested plants immediately
  if (plant.harvestDate) {
    const harvestStage = getGrowthStage("harvested");
    return {
      currentPhase: "harvested",
      overallProgress: 100,
      phaseProgress: 100,
      estimatedHarvestDate: null,
      daysUntilNextPhase: null,
      nextPhase: null,
      phaseIcon: harvestStage.icon,
    };
  }

  // Initialize variables for progress calculation
  let completedPhasesWeight = 0;
  let totalPhasesWeight = 0;

  // Map of available phases and their data
  const phases: Record<GrowthPhase, { date: Date | null; stage: GrowthStage }> =
    {
      planted: { date: plant.startDate, stage: getGrowthStage("planted") },
      seedling: {
        date: plant.seedlingPhaseStart,
        stage: getGrowthStage("seedling"),
      },
      vegetation: {
        date: plant.vegetationPhaseStart,
        stage: getGrowthStage("vegetation"),
      },
      flowering: {
        date: plant.floweringPhaseStart,
        stage: getGrowthStage("flowering"),
      },
      harvested: {
        date: plant.harvestDate,
        stage: getGrowthStage("harvested"),
      },
      curing: { date: plant.curingPhaseStart, stage: getGrowthStage("curing") },
    };

  // Calculate total weight for expected phases
  const expectedPhases: GrowthPhase[] = [
    "planted",
    "seedling",
    "vegetation",
    "flowering",
  ];
  expectedPhases.forEach((phaseName) => {
    totalPhasesWeight += phases[phaseName].stage.weight || 0;
  });

  // Find the current phase (last non-null phase date)
  let currentPhase: GrowthPhase = "planted";
  let nextPhase: GrowthPhase | null = "seedling";

  if (plant.floweringPhaseStart) {
    currentPhase = "flowering";
    nextPhase = "harvested";
    completedPhasesWeight =
      (phases.planted.stage.weight || 0) +
      (phases.seedling.stage.weight || 0) +
      (phases.vegetation.stage.weight || 0);
  } else if (plant.vegetationPhaseStart) {
    currentPhase = "vegetation";
    nextPhase = "flowering";
    completedPhasesWeight =
      (phases.planted.stage.weight || 0) + (phases.seedling.stage.weight || 0);
  } else if (plant.seedlingPhaseStart) {
    currentPhase = "seedling";
    nextPhase = "vegetation";
    completedPhasesWeight = phases.planted.stage.weight || 0;
  }

  // Calculate current phase progress
  const currentStage = phases[currentPhase].stage;
  const currentPhaseStartDate = phases[currentPhase].date;
  let phaseProgress = 0;
  let elapsedWeeks = 0;

  if (currentPhaseStartDate) {
    elapsedWeeks = getWeeksBetween(currentPhaseStartDate, now);
    phaseProgress = Math.min(
      100,
      currentStage.typical_duration && currentStage.typical_duration > 0
        ? (elapsedWeeks / currentStage.typical_duration) * 100
        : 100,
    );
  }

  // Calculate days until next phase
  let daysUntilNextPhase: number | null = null;
  if (
    currentPhaseStartDate &&
    currentStage.typical_duration &&
    currentStage.typical_duration !== Infinity
  ) {
    const phaseDurationDays = currentStage.typical_duration * 7;
    const elapsedDays = getDaysBetween(currentPhaseStartDate, now);
    daysUntilNextPhase = Math.max(0, phaseDurationDays - elapsedDays);
  }

  // Calculate estimated harvest date
  let estimatedHarvestDate: Date | null = null;
  // Fix the type error by using an array includes check
  if (!["harvested", "curing"].includes(currentPhase)) {
    estimatedHarvestDate = new Date(plant.startDate);

    // Add the typical duration of all phases up to harvest
    let remainingPhases: GrowthPhase[] = [];

    if (currentPhase === "planted") {
      remainingPhases = ["seedling", "vegetation", "flowering"];
    } else if (currentPhase === "seedling") {
      remainingPhases = ["vegetation", "flowering"];
    } else if (currentPhase === "vegetation") {
      remainingPhases = ["flowering"];
    } else if (currentPhase === "flowering") {
      // Only remaining days in flowering phase
      const stage = getGrowthStage("flowering");
      if (currentPhaseStartDate && stage.typical_duration) {
        const totalDays = stage.typical_duration * 7;
        const elapsedDays = getDaysBetween(currentPhaseStartDate, now);
        const remainingDays = Math.max(0, totalDays - elapsedDays);
        estimatedHarvestDate = new Date(now);
        estimatedHarvestDate.setDate(
          estimatedHarvestDate.getDate() + remainingDays,
        );
      }
      remainingPhases = [];
    }

    // Calculate based on typical durations if we're not in flowering yet
    if (remainingPhases.length > 0) {
      let totalRemainingDays = 0;

      // If we're in the middle of a phase, calculate remaining days in current phase
      if (currentPhaseStartDate && currentStage.typical_duration) {
        const totalPhaseDays = currentStage.typical_duration * 7;
        const elapsedDays = getDaysBetween(currentPhaseStartDate, now);
        totalRemainingDays += Math.max(0, totalPhaseDays - elapsedDays);
      }

      // Add typical duration for remaining phases
      for (const phaseName of remainingPhases) {
        const stage = getGrowthStage(phaseName);
        if (stage.typical_duration) {
          totalRemainingDays += stage.typical_duration * 7;
        }
      }

      estimatedHarvestDate = new Date(now);
      estimatedHarvestDate.setDate(
        estimatedHarvestDate.getDate() + totalRemainingDays,
      );
    }
  }

  // Calculate overall progress using weights
  const currentPhaseContribution = currentStage.weight
    ? (currentStage.weight * phaseProgress) / 100
    : 0;

  const overallProgress = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        ((completedPhasesWeight + currentPhaseContribution) * 100) /
          totalPhasesWeight,
      ),
    ),
  );

  return {
    currentPhase,
    overallProgress,
    phaseProgress: Math.min(100, Math.max(0, Math.round(phaseProgress))),
    estimatedHarvestDate,
    daysUntilNextPhase,
    nextPhase,
    phaseIcon: currentStage.icon,
  };
}
