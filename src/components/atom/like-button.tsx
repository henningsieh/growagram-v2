"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/lib/trpc/react";
import { cn } from "~/lib/utils";
import { ToggleLikeInput } from "~/server/api/root";
import { LikeableEntityType } from "~/types/like";

interface LikeProps {
  entityId: string;
  entityType: LikeableEntityType;
  initialLiked?: boolean;
  initialLikeCount?: number;
  className?: string;
  isLikeStatusLoading: boolean;
}

export const LikeButton: React.FC<LikeProps> = ({
  entityId,
  entityType,
  initialLiked = false,
  initialLikeCount = 0,
  className = "",
  isLikeStatusLoading = true,
}) => {
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isAnimating, setIsAnimating] = useState(false);

  // Add useEffect to synchronize state with initial props
  useEffect(() => {
    setIsLiked(initialLiked);
    setLikeCount(initialLikeCount);
  }, [initialLiked, initialLikeCount]);

  const toggleLikeMutation = api.likes.toggleLike.useMutation({
    onMutate: (variables) => {
      // Do an optimistic update
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1));

      // Trigger one-time animation
      if (newLikedState) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500); // Match animation duration
      }

      console.debug("Attempting to like/unlike:", variables);
      return { variables };
    },
    onSuccess: (data, variables) => {
      console.debug("Like toggled successfully:", {
        liked: data.liked,
        entityId: variables.entityId,
        entityType: variables.entityType,
      });
    },
    onError: (error) => {
      // Revert the optimistic update on error
      setIsLiked(initialLiked);
      setLikeCount(initialLikeCount);
      toast({
        title: "Error",
        description: "Failed to process like. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLikeToggle = () => {
    toggleLikeMutation.mutate({
      entityId,
      entityType,
    } satisfies ToggleLikeInput);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleLikeToggle}
      disabled={toggleLikeMutation.isPending}
      className={cn(
        className,
        "group flex cursor-default items-center gap-1 disabled:cursor-default disabled:opacity-100",
        isLikeStatusLoading ? "cursor-not-allowed" : "cursor-default",
      )}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-all duration-300 ease-in-out",
          isLiked ? "fill-red-500 text-red-500" : "text-foreground",
          isAnimating && "scale-150 animate-pulse",
          // Ensure hover effect only applies when not animating
          !isAnimating && "group-hover:scale-110 group-hover:text-red-500",
        )}
        strokeWidth={1.5}
      />
      <span className={cn("text-base text-foreground")}>{likeCount}</span>
    </Button>
  );
};
