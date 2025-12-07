import type { LucideIcon } from "lucide-react";

import type { GetOwnPlantType } from "~/server/api/root";

import {
  type GrowthPhase,
  buildPlantGrowthPhases,
  getGrowthStage,
  orderedPhases,
} from "~/types/plant";

import { getDaysBetween, getWeeksBetween } from "~/lib/utils";

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

  // Use the utility function from plant.ts to build phases object
  const phases = buildPlantGrowthPhases(plant);

  // Handle curing phase if a plant has been harvested AND moved to curing
  if (plant.harvestDate && plant.curingPhaseStart) {
    const curingStage = getGrowthStage("curing");
    return {
      currentPhase: "curing",
      overallProgress: 100,
      phaseProgress: 100,
      estimatedHarvestDate: null,
      daysUntilNextPhase: null,
      nextPhase: null,
      phaseIcon: curingStage.icon,
    };
  }

  // Handle harvested plants
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

  // Determine currentPhase by finding the last phase with a non-null date
  let currentPhaseIndex = 0;
  for (let i = 0; i < orderedPhases.length; i++) {
    if (phases[orderedPhases[i]].date) {
      currentPhaseIndex = i;
    }
  }
  const currentPhase: GrowthPhase = orderedPhases[currentPhaseIndex];
  const nextPhase: GrowthPhase | null =
    currentPhaseIndex < orderedPhases.length - 1
      ? orderedPhases[currentPhaseIndex + 1]
      : null;

  // Calculate completed weight based on phases completed before the current phase
  let completedPhasesWeight = 0;
  for (let i = 0; i < currentPhaseIndex; i++) {
    completedPhasesWeight += phases[orderedPhases[i]].stage.weight || 0;
  }

  // Calculate total phases weight (only for phases with a weight)
  let totalPhasesWeight = 0;
  orderedPhases.forEach((phaseName) => {
    if (phases[phaseName].stage.weight && phases[phaseName].stage.weight > 0) {
      totalPhasesWeight += phases[phaseName].stage.weight;
    }
  });

  // Calculate current phase progress
  const currentStage = phases[currentPhase].stage;
  const currentPhaseStartDate = phases[currentPhase].date;
  let phaseProgress = 0;
  if (
    currentPhaseStartDate &&
    currentStage.typical_duration &&
    currentStage.typical_duration > 0 &&
    isFinite(currentStage.typical_duration)
  ) {
    const elapsedWeeks = getWeeksBetween(currentPhaseStartDate, now);
    phaseProgress = Math.min(
      100,
      (elapsedWeeks / currentStage.typical_duration) * 100,
    );
  } else {
    phaseProgress = 100;
  }

  // Calculate days until next phase
  let daysUntilNextPhase: number | null = null;
  if (
    currentPhaseStartDate &&
    currentStage.typical_duration &&
    isFinite(currentStage.typical_duration)
  ) {
    const phaseDurationDays = currentStage.typical_duration * 7;
    const elapsedDays = getDaysBetween(currentPhaseStartDate, now);
    daysUntilNextPhase = Math.max(0, phaseDurationDays - elapsedDays);
  }

  // Calculate estimated harvest date (only for the "flowering" phase)
  let estimatedHarvestDate: Date | null = null;
  if (currentPhase === "flowering") {
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
  }

  // Calculate overall progress using weights
  const currentPhaseContribution = currentStage.weight
    ? (currentStage.weight * phaseProgress) / 100
    : 0;
  const overallProgress = Math.min(
    100,
    Math.round(
      ((completedPhasesWeight + currentPhaseContribution) * 100) /
        totalPhasesWeight,
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
