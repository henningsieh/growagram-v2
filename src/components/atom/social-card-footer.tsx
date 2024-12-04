"use client";

import { ChartColumn, MessageCircle, Share } from "lucide-react";
import React from "react";
import { LikeButton } from "~/components/atom/like";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface CardFooterProps {
  entityId: string;
  entityType: "plant" | "image";
  initialLiked?: boolean;
  isLikeStatusLoading: boolean;
  className?: string;
  stats: {
    comments: number;
    views: number;
    likes: number;
  };
}

export const SocialCardFooter: React.FC<CardFooterProps> = ({
  entityId,
  entityType,
  initialLiked = false,
  isLikeStatusLoading = true,
  className = "",
  stats,
}) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <Button variant="ghost" size="sm" className="flex items-center gap-1">
        <MessageCircle className="h-4 w-4" />
        <span>{stats.comments}</span>
      </Button>
      <Button variant="ghost" size="sm" className="flex items-center gap-1">
        <ChartColumn className="h-4 w-4" />
        <span>{stats.views}</span>
      </Button>
      <LikeButton
        entityId={entityId}
        entityType={entityType}
        initialLiked={initialLiked}
        initialLikeCount={stats.likes}
        isLikeStatusLoading={isLikeStatusLoading}
        className={"disabled:cursor-wait disabled:opacity-100"}
      />
      <Button variant="ghost" size="sm" className="flex items-center gap-1">
        <Share className="h-4 w-4" />
      </Button>
    </div>
  );
};
