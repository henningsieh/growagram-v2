"use client";

import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { calculateGrowthProgress } from "~/lib/utils/calculateGrowthProgress";
import type { PlantByIdType } from "~/server/api/root";

interface PlantsOverviewChartProps {
  plantsData?: PlantByIdType[];
}

export function PlantsOverviewChart({ plantsData }: PlantsOverviewChartProps) {
  const t = useTranslations("Plants");

  // If no data, return placeholder
  if (!plantsData || plantsData.length === 0) {
    return (
      <div className="text-muted-foreground flex h-[300px] w-full items-center justify-center">
        {t("no-plants-yet")}
      </div>
    );
  }

  // Process data for the chart
  const chartData = plantsData.slice(0, 6).map((plant) => {
    const progress = calculateGrowthProgress(plant);

    // Create an object with the plant name and overall progress
    const chartItem = {
      name:
        plant.name.length > 12
          ? plant.name.substring(0, 12) + "..."
          : plant.name,
      totalProgress: progress.overallProgress,
    };

    // Add phase-specific data based on current phase
    switch (progress.currentPhase) {
      case "planted":
        return {
          ...chartItem,
          planted: progress.phaseProgress,
        };
      case "seedling":
        return {
          ...chartItem,
          seedling: progress.phaseProgress,
        };
      case "vegetation":
        return {
          ...chartItem,
          vegetation: progress.phaseProgress,
        };
      case "flowering":
        return {
          ...chartItem,
          flowering: progress.phaseProgress,
        };
      case "harvested":
        return {
          ...chartItem,
          harvested: progress.phaseProgress,
        };
      default:
        return chartItem;
    }
  });

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}%`}
          fontSize={12}
        />
        <Tooltip
          formatter={(value) => [`${value}%`, ""]}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid var(--border)",
            backgroundColor: "var(--background)",
          }}
        />
        <Bar dataKey="planted" fill="#9ca3af" radius={[2, 2, 0, 0]} />
        <Bar dataKey="seedling" fill="#94e2cd" radius={[2, 2, 0, 0]} />
        <Bar dataKey="vegetation" fill="#22c55e" radius={[2, 2, 0, 0]} />
        <Bar dataKey="flowering" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
        <Bar dataKey="harvested" fill="#eab308" radius={[2, 2, 0, 0]} />
        <Bar dataKey="totalProgress" fill="#3b82f6" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
