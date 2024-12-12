// src/components/atom/social-card-footer.tsx:
import { ChartColumn, MessageCircle, Share } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React from "react";
import { LikeButton } from "~/components/atom/like-button";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { LikeableEntityType } from "~/types/like";

import SpinningLoader from "../Layouts/loader";

interface CardFooterProps {
  entityId: string;
  entityType: LikeableEntityType;
  initialLiked?: boolean;
  isLikeStatusLoading: boolean;
  commentCountLoading: boolean;
  className?: string;
  stats: {
    comments: number;
    views: number;
    likes: number;
  };
  toggleComments: () => void;
}

export const SocialCardFooter: React.FC<CardFooterProps> = ({
  entityId,
  entityType,
  initialLiked = false,
  isLikeStatusLoading = true,
  commentCountLoading = true,
  className = "",
  stats,
  toggleComments,
}) => {
  const { data: session } = useSession();
  const user = session?.user;
  const t = useTranslations();

  const renderInteractiveButton = (
    Icon: React.ElementType,
    tooltipMessage: string,
    isLoading: boolean,
    count?: number,
    onClick?: () => void,
  ) => {
    const buttonContent = (
      <Button
        className="flex w-12 items-center justify-center gap-1"
        variant="ghost"
        size="sm"
        onClick={onClick}
      >
        {!isLoading ? (
          <Icon className="h-4 w-4" />
        ) : (
          <SpinningLoader className="h-6 w-6 text-secondary" />
        )}
        {!isLoading && count && <span>{count}</span>}
      </Button>
    );

    if (user) return buttonContent;

    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent
            side="top"
            className="flex flex-col items-center space-y-2 bg-secondary p-4"
          >
            <p className="text-sm font-medium">{tooltipMessage}</p>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                // Replace with your actual login redirect method
                // For example: signIn() from next-auth
                // signIn();
              }}
            >
              {t("LoginPage.submit")}
            </Button>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div>
      <div className={cn("flex items-center justify-between gap-2", className)}>
        {renderInteractiveButton(
          MessageCircle,
          "Sign in to view and add comments",
          commentCountLoading,
          stats.comments,
          toggleComments,
        )}
        {renderInteractiveButton(
          ChartColumn,
          "Login to see detailed view statistics",
          false,
          stats.views,
        )}

        <LikeButton
          className="flex w-16 items-center justify-center gap-1 hover:bg-transparent"
          entityId={entityId}
          entityType={entityType}
          initialLiked={initialLiked}
          initialLikeCount={stats.likes}
          isLikeStatusLoading={isLikeStatusLoading}
        />

        {renderInteractiveButton(
          Share,
          "Please log in to share this content",
          false,
          undefined,
        )}
      </div>
    </div>
  );
};
