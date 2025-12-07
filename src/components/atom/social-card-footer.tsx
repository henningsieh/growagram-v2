// src/components/atom/social-card-footer.tsx
import * as React from "react";

// eslint-disable-next-line no-restricted-imports
import Link from "next/link";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import { ChartColumnIcon, MessagesSquareIcon, ShareIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import { LikeButton } from "~/components/atom/like-button";
import SpinningLoader from "~/components/atom/spinning-loader";

import { LikeableEntityType } from "~/types/like";

import { usePathname } from "~/lib/i18n/routing";
import { cn } from "~/lib/utils";

interface CardFooterProps {
  entityId: string;
  entityType: LikeableEntityType;
  initialLiked?: boolean;
  isLikeStatusLoading: boolean;
  commentCountLoading: boolean;
  className?: string;
  stats: {
    comments: number | undefined;
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
  const pathname = usePathname();

  const renderButton = (
    ButtonComponent: React.ReactNode,
    tooltipMessage: string,
  ) => {
    if (user) return ButtonComponent;

    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{ButtonComponent}</TooltipTrigger>
          <TooltipContent
            side="top"
            className="bg-secondary flex max-w-64 flex-col items-center space-y-2 p-2"
          >
            <p className="text-center text-sm font-semibold">
              {tooltipMessage}
            </p>
            <Button size="sm" variant="primary" asChild>
              <Link href={`/api/auth/signin?callbackUrl=${pathname}`}>
                {t("LoginPage.submit")}
              </Link>
            </Button>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <>
      <div
        className={cn(
          "isolate flex items-center justify-between gap-2 py-1 pr-2",
          className,
        )}
      >
        {renderButton(
          <Button
            className="flex h-8 w-10 items-center justify-center gap-1"
            variant="ghost"
            size="sm"
            onClick={toggleComments}
            disabled={!user || commentCountLoading}
          >
            {commentCountLoading ? (
              <SpinningLoader className="text-secondary h-6 w-6" />
            ) : (
              <MessagesSquareIcon className="h-4 w-4" />
            )}
            {!commentCountLoading && <span>{stats.comments}</span>}
          </Button>,
          t("CardFooter.Sign in to view and add comments"),
        )}

        {renderButton(
          <Button
            className="flex h-8 w-10 items-center justify-center gap-1"
            variant="ghost"
            size="sm"
            disabled={!user}
          >
            <ChartColumnIcon className="h-4 w-4" />
            <span>{stats.views}</span>
          </Button>,
          t("CardFooter.Login to see detailed view statistics"),
        )}

        {renderButton(
          <LikeButton
            className="flex w-10 items-center justify-center gap-1 hover:bg-transparent"
            entityId={entityId}
            entityType={entityType}
            initialLiked={initialLiked}
            initialLikeCount={stats.likes}
            disabled={!user}
            isLikeStatusLoading={isLikeStatusLoading}
          />,
          t("CardFooter.Please log in to like this content"),
        )}

        {renderButton(
          <Button
            className="flex h-8 w-8 items-center justify-center gap-1"
            variant="ghost"
            size="sm"
            disabled={!user}
          >
            <ShareIcon className="h-4 w-4" />
          </Button>,
          t("CardFooter.Please log in to share this content"),
        )}
      </div>
    </>
  );
};
