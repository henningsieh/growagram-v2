// src/components/atom/social-card-footer.tsx
import { ChartColumn, MessageCircle, Share } from "lucide-react";
import React from "react";
import { LikeButton } from "~/components/atom/like-button";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { LikeableEntityType } from "~/types/like";

interface CardFooterProps {
  entityId: string;
  entityType: LikeableEntityType;
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
    <div className={cn("flex items-center justify-between gap-2", className)}>
      <Button
        className="flex w-16 items-center justify-center gap-1"
        variant="ghost"
        size="sm"
      >
        <MessageCircle className="h-4 w-4" />
        <span>{stats.comments}</span>
      </Button>
      <Button
        className="flex w-16 items-center justify-center gap-1"
        variant="ghost"
        size="sm"
      >
        <ChartColumn className="h-4 w-4" />
        <span>{stats.views}</span>
      </Button>
      <LikeButton
        className="flex w-16 items-center justify-center gap-1 hover:bg-transparent"
        entityId={entityId}
        entityType={entityType}
        initialLiked={initialLiked}
        initialLikeCount={stats.likes}
        isLikeStatusLoading={isLikeStatusLoading}
      />
      <Button
        className="flex w-16 items-center justify-center gap-1"
        variant="ghost"
        size="sm"
      >
        <Share className="h-4 w-4" />
      </Button>
    </div>
  );
};
