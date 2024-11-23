"use client";

import { useState } from "react";
import PageHeader from "~/components/Layouts/page-header";
import ResponsiveGrid from "~/components/Layouts/responsive-grid";
import { GrowCard } from "~/components/features/Grows/grow-card";
import { Grow } from "~/components/features/Timeline/post";

// Mock data for multiple grows
const mockGrows: Grow[] = [
  {
    id: "1",
    name: "Indoor Grow 2024",
    image: "/images/IMG_20241005_062601~2.jpg",
    startDate: new Date("2024-01-01"),
    updatedAt: new Date("2024-09-16"),
    type: "indoor",
    plants: [
      { id: "p1", strain: "Northern Lights", growPhase: "vegetation" },
      { id: "p2", strain: "White Widow", growPhase: "flowering" },
    ],
  },
  {
    id: "2",
    name: "Outdoor Summer Grow",
    image: "/images/IMG_20241020_102123.jpg",
    startDate: new Date("2024-05-01"),
    updatedAt: new Date("2024-10-31"),
    type: "outdoor",
    plants: [
      { id: "p3", strain: "Blue Dream", growPhase: "seedling" },
      { id: "p4", strain: "Girl Scout Cookies", growPhase: "vegetation" },
    ],
  },
];

export default function MyGrowsPage() {
  const [grows, setGrows] = useState<Grow[]>(mockGrows);

  return (
    <PageHeader title="My Grows" subtitle="View and manage your current grows">
      <ResponsiveGrid>
        {grows.map((grow) => (
          <GrowCard key={grow.id} grow={grow} showUnassignButton={false} />
        ))}
      </ResponsiveGrid>
    </PageHeader>
  );
}
