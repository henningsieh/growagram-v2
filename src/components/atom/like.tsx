"use client";

// src/components/atom/like.tsx:
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/lib/trpc/react";
import { cn } from "~/lib/utils";

interface LikeProps {
  entityId: string;
  entityType: "plant" | "image";
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
      // Optimistic update
      setIsLiked((prev) => !prev);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    },
    onSuccess: (data) => {
      // Log the returned boolean
      console.debug("Like toggled:", data.liked);
    },
    onError: (error) => {
      // Revert optimistic update on error
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
    });
  };

  return (
    <div className={cn(`flex items-center space-x-1`)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLikeToggle}
        disabled={toggleLikeMutation.isPending}
        className={cn(
          className,
          isLikeStatusLoading ? "cursor-wait" : "cursor-default",
          "hover:bg-transparent",
        )}
      >
        <Heart
          className={`${
            isLiked
              ? "fill-red-500 text-red-500"
              : "text-gray-500 hover:text-red-500"
          } h-5 w-5 transition-colors duration-500 ease-in-out`}
          strokeWidth={1.5}
        />
      </Button>
      <span className={cn("text-base text-muted-foreground")}>{likeCount}</span>
    </div>
  );
};
