"use client";

// src/components/atom/like-button.tsx:
import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
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
  const { data: session, status } = useSession();
  const user = session?.user;

  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsLiked(initialLiked);
    setLikeCount(initialLikeCount);
  }, [initialLiked, initialLikeCount]);

  const toggleLikeMutation = api.likes.toggleLike.useMutation({
    onMutate: (variables) => {
      // Prevent like actions for unauthenticated users
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please log in to like content.",
          variant: "primary",
        });
        return null;
      }

      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1));

      if (newLikedState) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
      }

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
      setIsLiked(initialLiked);
      setLikeCount(initialLikeCount);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLikeToggle = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to like content.",
        variant: "destructive",
      });
      return;
    }

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
        "group flex cursor-default items-center gap-1 hover:text-foreground",
        // !user ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      )}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-all duration-300 ease-in-out",
          // !user && "text-muted-foreground",
          isLiked ? "fill-red-500 text-red-500" : "text-foreground",
          isAnimating && "scale-150 animate-pulse",
          !isAnimating && "group-hover:text-red-500",
        )}
        strokeWidth={1.5}
      />
      <div style={{ overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          <motion.span
            key={likeCount}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 800, // Controls "springiness"
              damping: 20, // Controls bounce and oscillation
            }}
            style={{ display: "inline-block" }}
          >
            {likeCount}
          </motion.span>
        </AnimatePresence>
      </div>
    </Button>
  );
};
