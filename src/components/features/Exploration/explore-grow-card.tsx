"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import type { inferRouterOutputs } from "@trpc/server";
import { Calendar, Eye, Leaf, MapPin, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { formatDate } from "~/lib/utils";
import type { AppRouter } from "~/server/api/root";
import { modulePaths } from "../../../assets/constants";

// Type for a single grow from the explore endpoint
type ExploreGrow =
  inferRouterOutputs<AppRouter>["grows"]["explore"]["grows"][number];

interface ExploreGrowCardProps {
  grow: ExploreGrow;
}

export function ExploreGrowCard({ grow }: ExploreGrowCardProps) {
  const tExplore = useTranslations("Explore");

  // Get primary plant image (first plant's header image or first plant image)
  const primaryPlant = grow.plants?.[0];
  const plantImageUrl =
    primaryPlant?.headerImage?.imageUrl ||
    primaryPlant?.plantImages?.[0]?.image?.imageUrl;

  // Get owner initials for avatar fallback
  const ownerInitials = grow.owner?.username
    ? grow.owner.username.substring(0, 2).toUpperCase()
    : "U";

  // Format creation date
  const createdDate = formatDate(grow.createdAt, "en");

  return (
    <TooltipProvider>
      <Card className="group hover:shadow-primary/5 relative overflow-hidden transition-all duration-200 hover:shadow-md">
        {/* Header Image */}
        <div className="bg-muted relative aspect-video overflow-hidden">
          {grow.headerImage?.imageUrl ? (
            <Image
              fill
              src={grow.headerImage.imageUrl}
              alt={`${grow.name} header`}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
          ) : plantImageUrl ? (
            <Image
              fill
              src={plantImageUrl}
              alt={`${grow.name} plant`}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20">
              <Leaf className="h-12 w-12 text-green-500 dark:text-green-400" />
            </div>
          )}

          {/* Plant count badge */}
          {grow.plants && grow.plants.length > 0 && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 bg-black/70 text-white hover:bg-black/80"
            >
              <Leaf className="mr-1 h-3 w-3" />
              {grow.plants.length}{" "}
              {grow.plants.length === 1
                ? tExplore("plant")
                : tExplore("plants")}
            </Badge>
          )}
        </div>

        <CardHeader className="pb-3">
          {/* Grow title and link */}
          <div className="space-y-2">
            <Link
              href={`/app/grows/${grow.id}`}
              className="hover:text-primary text-lg leading-tight font-semibold transition-colors"
            >
              {grow.name}
            </Link>

            {/* Owner info */}
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={grow.owner?.image || ""}
                  alt={grow.owner?.username || ""}
                />
                <AvatarFallback className="text-xs">
                  {ownerInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground text-sm">
                {"by "}
                {grow.owner?.username || "Unknown"}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filter highlights - Key exploration info */}
          <div className="grid grid-cols-2 gap-2">
            {/* Environment */}
            {grow.environment && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{grow.environment}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {tExplore("environment")}
                    {": "}
                    {grow.environment}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Culture Medium */}
            {grow.cultureMedium && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Leaf className="h-3 w-3" />
                    <span className="truncate">{grow.cultureMedium}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {tExplore("culture-medium")}
                    {": "}
                    {grow.cultureMedium}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Fertilizer Type */}
            {grow.fertilizerType && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Sparkles className="h-3 w-3" />
                    <span className="truncate">{grow.fertilizerType}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {tExplore("fertilizer-type")}
                    {": "}
                    {grow.fertilizerType}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Fertilizer Form */}
            {grow.fertilizerForm && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Sparkles className="h-3 w-3" />
                    <span className="truncate">{grow.fertilizerForm}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {tExplore("fertilizer-form")}
                    {": "}
                    {grow.fertilizerForm}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Strain info (if available) */}
          {primaryPlant?.strain && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {primaryPlant.strain.strainType}
                </Badge>
                {primaryPlant.strain.geneticsType && (
                  <Badge variant="secondary" className="text-xs">
                    {primaryPlant.strain.geneticsType}
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium">{primaryPlant.strain.name}</p>
              {primaryPlant.strain.breeder && (
                <p className="text-muted-foreground text-xs">
                  {"by "}
                  {primaryPlant.strain.breeder.name}
                </p>
              )}
            </div>
          )}

          {/* Bottom row - Date and view link */}
          <div className="flex items-center justify-between border-t pt-2">
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              {createdDate}
            </div>

            <Link
              href={`${modulePaths.PUBLICGROWS.path}/${grow.id}`}
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs transition-colors"
            >
              <Eye className="h-3 w-3" />
              {tExplore("view-grow")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
