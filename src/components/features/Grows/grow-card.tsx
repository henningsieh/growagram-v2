"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Edit, Tag, Trash2, User2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import headerImagePlaceholder from "~/assets/landscape-placeholdersvg.svg";
import { SocialCardFooter } from "~/components/atom/social-card-footer";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { useComments } from "~/hooks/use-comments";
import { useLikeStatus } from "~/hooks/use-likes";
import { Link } from "~/lib/i18n/routing";
import { DateFormatOptions, formatDate } from "~/lib/utils";
import { GetOwnGrowType } from "~/server/api/root";
import { CommentableEntityType } from "~/types/comment";
import { LikeableEntityType } from "~/types/like";

import { ItemComments } from "../Comments/item-comments";
import { GrowPlantCard } from "./grow-plant-card";

interface GrowCardProps {
  grow: GetOwnGrowType;
  isSocial?: boolean;
}

export function GrowCard({ grow, isSocial }: GrowCardProps) {
  const [isImageHovered, setIsImageHovered] = useState(false);

  const {
    isLiked,
    likeCount,
    isLoading: isLikeLoading,
  } = useLikeStatus(grow.id, LikeableEntityType.Grow);

  const {
    commentCount,
    isCommentsOpen,
    toggleComments,
    commentsLoading,
    commentCountLoading,
    comments,
    newComment,
    setNewComment,
    handleSubmitComment,
    handleReply,
    handleCancelReply,
    replyingToComment,
    user,
  } = useComments(grow.id, CommentableEntityType.Grow);

  const locale = useLocale();
  const t = useTranslations("Grows");

  return (
    <Card className="my-2 flex flex-col overflow-hidden">
      {isSocial && (
        <CardHeader className="space-y-0 p-3">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={grow.owner.image as string | undefined} />
                <AvatarFallback>
                  <User2 className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-semibold">{grow.owner.name}</p>
                <p className="text-sm text-muted-foreground">
                  {`@${grow.owner.name}`}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent
        className={`grid flex-grow grid-rows-[auto,1fr,auto] gap-4 ${isSocial ? "ml-16 p-2 pl-0" : "p-4"}`}
      >
        <div
          className="relative aspect-video overflow-hidden"
          onMouseEnter={() => setIsImageHovered(true)}
          onMouseLeave={() => setIsImageHovered(false)}
        >
          <Image
            src={headerImagePlaceholder}
            alt={grow.name}
            fill
            className="object-cover transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            style={{
              transform: isImageHovered ? "scale(1.05)" : "scale(1)",
            }}
          />
        </div>
        <div>
          <CardHeader className="p-0">
            <Link href={`/public/grows/${grow.id}`}>
              <CardTitle level="h3">
                <div className="flex w-full items-center gap-2">
                  <Tag size={20} />
                  <h3 className="text-xl font-bold">{grow.name}</h3>
                </div>
              </CardTitle>
            </Link>
            <CardDescription>
              <span className="block">
                {t("grow-card-createdAt")}:{" "}
                {formatDate(grow.createdAt, locale, {
                  weekday: "short",
                  month: "long",
                } as DateFormatOptions)}
              </span>
              {grow.updatedAt && (
                <div className="block">
                  {t("grow-card-updatedAt")}:{" "}
                  {formatDate(grow.updatedAt, locale, {
                    weekday: "short",
                    month: "long",
                  } as DateFormatOptions)}
                </div>
              )}
            </CardDescription>
          </CardHeader>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {grow.plants.map((plant) => (
              <motion.div
                key={plant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <GrowPlantCard plant={plant} />
              </motion.div>
            ))}
          </AnimatePresence>
          {grow.plants.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              {t("no-plants-found")}
            </div>
          )}
        </div>
      </CardContent>

      {isSocial ? (
        <SocialCardFooter
          className={`pb-2 pr-2 ${isSocial && "ml-16"}`}
          entityId={grow.id}
          entityType={LikeableEntityType.Grow}
          initialLiked={isLiked}
          isLikeStatusLoading={isLikeLoading}
          stats={{
            comments: commentCount,
            views: 0,
            likes: likeCount,
          }}
          toggleComments={toggleComments}
        />
      ) : (
        <>
          <Separator />
          <CardFooter className="flex w-full justify-between gap-1 p-1">
            <Button variant={"destructive"} size={"sm"} className="w-20">
              <Trash2 size={20} />
            </Button>
            <Button asChild size={"sm"} className="w-full text-base">
              <Link href={`/grows/${grow.id}/form`}>
                <Edit size={20} />
                {t("form-page-title-edit")}
              </Link>
            </Button>
          </CardFooter>
        </>
      )}
      {isSocial && isCommentsOpen && (
        <ItemComments
          entityId={grow.id}
          entityType={CommentableEntityType.Grow}
          isSocial={isSocial}
          comments={comments}
          commentsLoading={commentsLoading}
          newComment={newComment}
          setNewComment={setNewComment}
          handleSubmitComment={handleSubmitComment}
          handleReply={handleReply}
          handleCancelReply={handleCancelReply}
          replyingToComment={replyingToComment}
          user={user}
        />
      )}
    </Card>
  );
}
