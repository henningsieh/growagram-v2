"use client";

// src/components/atom/like-button.tsx:
import * as React from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import SpinningLoader from "~/components/atom/spinning-loader";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { ToggleLikeInput } from "~/server/api/root";
import { useTRPC } from "~/trpc/client";
import { LikeableEntityType } from "~/types/like";

interface LikeButtonProps {
  entityId: string;
  entityType: LikeableEntityType;
  initialLiked: boolean;
  initialLikeCount: number;
  isLikeStatusLoading: boolean;
  disabled: boolean;
  className?: string;
}

export const LikeButton = React.forwardRef<HTMLButtonElement, LikeButtonProps>(
  (
    {
      entityId,
      entityType,
      initialLiked = false,
      initialLikeCount = 0,
      isLikeStatusLoading = true,
      disabled,
      className = "",
      ...props
    },
    ref,
  ) => {
    const { data: session } = useSession();
    const user = session?.user;
    const trpc = useTRPC();
    const t = useTranslations("Likes");

    const [isLiked, setIsLiked] = React.useState(initialLiked);
    const [likeCount, setLikeCount] = React.useState(initialLikeCount);
    const [isAnimating, setIsAnimating] = React.useState(false);

    React.useEffect(() => {
      setIsLiked(initialLiked);
      setLikeCount(initialLikeCount);
    }, [initialLiked, initialLikeCount]);

    const toggleLikeMutation = useMutation({
      ...trpc.likes.toggleLike.mutationOptions({
        onMutate: (variables) => {
          // Prevent like actions for unauthenticated users
          if (!user) {
            toast(t("login-required-title"), {
              description: t("login-required-description"),
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
        onSuccess: (data) => {
          toast(t("success-title"), {
            description: data.liked ? t("liked-success") : t("unliked-success"),
          });
        },
        onError: (error) => {
          setIsLiked(initialLiked);
          setLikeCount(initialLikeCount);
          toast.error(t("error-title"), {
            description: error.message,
          });
        },
      }),
    });

    // const toggleLikeMutation = api.likes.toggleLike.useMutation({
    //   onMutate: (variables) => {
    //     // Prevent like actions for unauthenticated users
    //     if (!user) {
    //       toast(t("login-required-title"), {
    //         description: t("login-required-description"),
    //       });
    //       return null;
    //     }

    //     const newLikedState = !isLiked;
    //     setIsLiked(newLikedState);
    //     setLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1));

    //     if (newLikedState) {
    //       setIsAnimating(true);
    //       setTimeout(() => setIsAnimating(false), 500);
    //     }

    //     return { variables };
    //   },
    //   onSuccess: (data) => {
    //     toast(t("success-title"), {
    //       description: data.liked ? t("liked-success") : t("unliked-success"),
    //     });
    //   },
    //   onError: (error) => {
    //     setIsLiked(initialLiked);
    //     setLikeCount(initialLikeCount);
    //     toast.error(t("error-title"), {
    //       description: error.message,
    //     });
    //   },
    // });

    const handleLikeToggle = () => {
      if (!user) {
        toast(t("login-required-title"), {
          description: t("login-required-description"),
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
        ref={ref}
        {...props}
        variant="ghost"
        size="icon"
        onClick={handleLikeToggle}
        disabled={!isAnimating && (disabled || toggleLikeMutation.isPending)}
        className={cn(
          className,
          "group hover:text-foreground flex cursor-default items-center gap-1",
          // !user ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        )}
      >
        {isLikeStatusLoading ? (
          <SpinningLoader className="text-secondary h-6 w-6" />
        ) : (
          <>
            <Heart
              className={cn(
                "h-5 w-5 transition-all duration-300 ease-in-out",
                // !user && "text-muted-foreground",
                isLiked ? "fill-red-500 text-red-500" : "text-foreground",
                isAnimating && "scale-150 animate-pulse",
                !isAnimating && !disabled && "group-hover:text-red-500",
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
          </>
        )}
      </Button>
    );
  },
);
LikeButton.displayName = "LikeButton";
