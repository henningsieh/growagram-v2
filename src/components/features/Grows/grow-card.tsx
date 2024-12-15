"use client";

// src/components/features/Grows/grow-card.tsx:
import { AnimatePresence, motion } from "framer-motion";
import { Edit, Loader2, TentTree, Trash2, User2 } from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import headerImagePlaceholder from "~/assets/landscape-placeholdersvg.svg";
import { DeleteConfirmationDialog } from "~/components/atom/confirm-delete";
import { SocialCardFooter } from "~/components/atom/social-card-footer";
import SocialHeader from "~/components/atom/social-header";
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
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { useComments } from "~/hooks/use-comments";
import { useLikeStatus } from "~/hooks/use-likes";
import { useToast } from "~/hooks/use-toast";
import { Link } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import { DateFormatOptions, formatDate } from "~/lib/utils";
import { GetOwnGrowType } from "~/server/api/root";
import { CommentableEntityType } from "~/types/comment";
import { LikeableEntityType } from "~/types/like";

import { Comments } from "../Comments/comments";
import { GrowPlantCard } from "./grow-plant-card";

interface GrowCardProps {
  grow: GetOwnGrowType;
  isSocial?: boolean;
}

export function GrowCard({
  grow,
  isSocial: isSocialProp = true,
}: GrowCardProps) {
  const { data: session } = useSession();
  const user = session?.user;

  const locale = useLocale();
  const utils = api.useUtils();
  const { toast } = useToast();
  const t = useTranslations("Grows");

  const [isSocial, setIsSocial] = useState(isSocialProp);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    isLiked,
    likeCount,
    isLoading: isLikeLoading,
  } = useLikeStatus(grow.id, LikeableEntityType.Grow);

  const { commentCount, commentCountLoading, isCommentsOpen, toggleComments } =
    useComments(grow.id, CommentableEntityType.Grow);

  // Initialize delete mutation
  const deleteMutation = api.grows.deleteById.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Grow deleted successfully",
      });
      // Invalidate and prefetch the plants query to refresh the list
      await utils.grows.getOwnGrows.invalidate();
      // await utils.grows.getOwnGrows.prefetch();
      // router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete grow",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    await deleteMutation.mutateAsync({ id: grow.id });
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={confirmDelete}
        isDeleting={deleteMutation.isPending}
        title="Are you sure you want to remove this grow?"
        description="No plant will be deleted by this action!"
        alertCautionText="This action also deletes postings and other events if they only refer to this grow!"
      />
      <Card className="my-2 flex flex-col overflow-hidden">
        {isSocial && (
          <SocialHeader
            userName={grow.owner.name as string}
            userUserName={undefined}
            userAvatarUrl={grow.owner.image}
          />
        )}

        <CardContent
          className={`flex flex-1 flex-col gap-4 ${isSocial ? "ml-14 p-2 pl-0" : "p-4"}`}
        >
          {/* Grow HeaderImage */}
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

          {/* Title Link */}
          <div className="flex items-center">
            <CardTitle level="h2" className="flex items-center justify-between">
              <Button asChild variant="link" className="p-1">
                <Link
                  href={`/public/grows/${grow.id}`}
                  className="items-center gap-2"
                >
                  <TentTree className="mt-2" size={20} />
                  {grow.name}
                </Link>
              </Button>
            </CardTitle>
            {/* Switch for toggling isSocial */}
            {user && user.id === grow.ownerId && (
              <div className="ml-auto flex items-start gap-2">
                <Label
                  className="text-sm font-semibold"
                  htmlFor="show-socialMode"
                >
                  Social Mode
                </Label>
                <Switch
                  id="show-socialMode"
                  checked={isSocial}
                  onCheckedChange={setIsSocial}
                />
              </div>
            )}
          </div>

          {/* Grow created and updated at Date */}
          <CardDescription>
            <span className="block">
              {
                t("grow-card-createdAt")
                // eslint-disable-next-line react/jsx-no-literals
              }
              :{" "}
              {formatDate(grow.createdAt, locale, {
                weekday: "short",
                month: "long",
              } as DateFormatOptions)}
            </span>
            {grow.updatedAt && (
              <div className="block">
                {
                  t("grow-card-updatedAt")
                  // eslint-disable-next-line react/jsx-no-literals
                }
                :{" "}
                {formatDate(grow.updatedAt, locale, {
                  weekday: "short",
                  month: "long",
                } as DateFormatOptions)}
              </div>
            )}
          </CardDescription>

          {/* Plants Grid */}
          <div className="space-y-4">
            <AnimatePresence>
              {grow.plants.map((plant) => (
                <motion.div
                  key={plant.id}
                  initial={{ opacity: 0, y: -50 }}
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
          // Social Footer
          <SocialCardFooter
            className={`pb-2 pr-2 ${isSocial && "ml-14"}`}
            entityId={grow.id}
            entityType={LikeableEntityType.Grow}
            initialLiked={isLiked}
            isLikeStatusLoading={isLikeLoading}
            commentCountLoading={commentCountLoading}
            stats={{
              comments: commentCount,
              views: 0,
              likes: likeCount,
            }}
            toggleComments={toggleComments}
          />
        ) : (
          user &&
          user.id === grow.ownerId && (
            // Owner Buttons
            <>
              <Separator />
              <CardFooter className="flex w-full justify-between gap-1 p-1">
                <Button
                  variant={"destructive"}
                  size={"sm"}
                  className="w-20"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Trash2 size={20} />
                  )}
                </Button>
                <Button asChild size={"sm"} className="w-full text-base">
                  <Link href={`/grows/${grow.id}/form`}>
                    <Edit size={20} />
                    {t("form-page-title-edit")}
                  </Link>
                </Button>
              </CardFooter>
            </>
          )
        )}
        {isSocial && isCommentsOpen && (
          <Comments
            entityId={grow.id}
            entityType={CommentableEntityType.Grow}
            isSocial={isSocial}
          />
        )}
      </Card>
    </>
  );
}
