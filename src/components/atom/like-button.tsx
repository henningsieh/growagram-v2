"use client";

// src/components/atom/like-button.tsx:
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

  // Add useEffect to synchronize state with initial props
  useEffect(() => {
    setIsLiked(initialLiked);
    setLikeCount(initialLikeCount);
  }, [initialLiked, initialLikeCount]);

  const toggleLikeMutation = api.likes.toggleLike.useMutation({
    onMutate: (variables) => {
      // Do an optimistic update
      setIsLiked((prev) => !prev);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
      console.debug("Attempting to like/unlike:", variables);
      return { variables }; // Optional: return context for other callbacks
    },
    onSuccess: (data, variables) => {
      // Log the returned boolean
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
        "flex items-center disabled:cursor-wait disabled:opacity-100",
        isLikeStatusLoading ? "cursor-wait" : "cursor-default",
      )}
    >
      <Heart
        className={`${
          isLiked
            ? "fill-red-500 text-red-500"
            : "text-foreground hover:text-red-500"
        } h-5 w-5 transition-colors duration-500 ease-in-out`}
        strokeWidth={1.5}
      />
      <span className={cn("text-base text-muted-foreground")}>{likeCount}</span>
    </Button>
  );
};
