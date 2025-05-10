"use client";

// src/components/features/Grows/grow-card.tsx:
import * as React from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  EditIcon,
  ExternalLinkIcon,
  MessageSquareTextIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { modulePaths } from "~/assets/constants";
import { RESPONSIVE_IMAGE_SIZES } from "~/components/Layouts/responsive-grid";
import { ActionItem, ActionsMenu } from "~/components/atom/actions-menu";
import AvatarCardHeader from "~/components/atom/avatar-card-header";
import { DeleteConfirmationDialog } from "~/components/atom/confirm-delete";
import { EntityDateInfo } from "~/components/atom/entity-date-info";
import { SocialCardFooter } from "~/components/atom/social-card-footer";
import { Comments } from "~/components/features/Comments/comments";
import { EnhancedPlantCard } from "~/components/features/Plants/enhanced-plant-card.tsx";
import { PostFormModal } from "~/components/features/Timeline/Post/post-form-modal";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useComments } from "~/hooks/use-comments";
import { useLikeStatus } from "~/hooks/use-likes";
import { Link, useRouter } from "~/lib/i18n/routing";
import { cn, formatDate, formatTime } from "~/lib/utils";
import type { GetAllGrowType, GetOwnGrowType } from "~/server/api/root";
import { useTRPC } from "~/trpc/client";
import { CommentableEntityType } from "~/types/comment";
import { LikeableEntityType } from "~/types/like";
import { Locale } from "~/types/locale";
import { PostableEntityType } from "~/types/post";
import { UserRoles } from "~/types/user";

interface GrowCardProps {
  grow: GetOwnGrowType | GetAllGrowType;
  isSocial?: boolean;
}

export function GrowCard({
  grow,
  isSocial: isSocialProp = true,
}: GrowCardProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const locale = useLocale();

  const tCommon = useTranslations("Platform");
  const t = useTranslations("Grows");

  const { data: session } = useSession();
  const user = session?.user;

  const searchParams = useSearchParams();
  const currentParams = React.useMemo(() => {
    return new URLSearchParams(searchParams.toString());
  }, [searchParams]);

  const [isSocial, setIsSocial] = React.useState(isSocialProp);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = React.useState(false);

  const {
    isLiked,
    likeCount,
    isLoading: isLikeLoading,
  } = useLikeStatus(grow.id, LikeableEntityType.Grow);

  const { commentCount, commentCountLoading, isCommentsOpen, toggleComments } =
    useComments(grow.id, CommentableEntityType.Grow);

  const deleteMutation = useMutation(
    trpc.grows.deleteById.mutationOptions({
      onSuccess: async () => {
        toast(t("DeleteConfirmation.success-title"), {
          description: t("DeleteConfirmation.success-description"),
        });
        await queryClient.invalidateQueries({
          queryKey: [["grows", "getOwnGrows"]],
        });
      },
      onError: (error) => {
        toast.error(t("error-title"), {
          description: `${t("error-default")} ${error.message || ""}`,
        });
      },
    }),
  );

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    await deleteMutation.mutateAsync({ id: grow.id });
    setIsDeleteDialogOpen(false);
  };

  // Memoized actions array
  const actions = React.useMemo((): ActionItem[] => {
    if (!user) return [];

    const actions: ActionItem[] = [];

    // Public Link - Always show for owner
    if (user.id === grow.ownerId) {
      actions.push({
        icon: ExternalLinkIcon,
        label: t(`public-link-label`),
        onClick: () => {
          window.open(`${modulePaths.PUBLICGROWS.path}/${grow.id}`, "_blank");
        },
        variant: "ghost",
      });
    }

    // Edit Action - Only for owner
    if (user.id === grow.ownerId) {
      actions.push({
        icon: EditIcon,
        label: t("edit-button-label"),
        onClick: () => {
          // Construct the target URL with existing search parameters
          const targetPath = `${modulePaths.GROWS.path}/${grow.id}/form`;
          router.push(`${targetPath}?${currentParams.toString()}`);
        },
        variant: "ghost",
      });
    }

    // Delete Action - For owner and admin
    if (user.id === grow.ownerId || user.role === UserRoles.ADMIN) {
      actions.push({
        icon: Trash2Icon,
        label: t("delete-button-label"),
        onClick: handleDelete,
        variant: "destructive",
        disabled: deleteMutation.isPending,
      });
    }

    return actions;
  }, [
    t,
    user,
    grow.id,
    grow.ownerId,
    router,
    currentParams,
    deleteMutation.isPending,
  ]);

  const dateElement = (
    <Link
      href={`/public/grows/${grow.id}`}
      title={tCommon("updated-at")}
      className="text-muted-foreground flex items-center gap-1 text-sm whitespace-nowrap underline-offset-3 hover:underline"
    >
      {formatDate(grow.updatedAt, locale as Locale, { includeYear: false })}{" "}
      {formatTime(grow.updatedAt, locale as Locale)}
    </Link>
  );

  return (
    <>
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={confirmDelete}
        isDeleting={deleteMutation.isPending}
        title={t("DeleteConfirmation.title")}
        description={t("DeleteConfirmation.description")}
        alertCautionText={t("DeleteConfirmation.alertCautionText")}
      />
      <PostFormModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        entity={grow}
        entityType={PostableEntityType.GROW}
      />
      <Card
        className={cn(
          "border-secondary/60 flex h-full flex-col gap-0 overflow-hidden rounded-md border py-0 shadow-none",
        )}
      >
        {/* Card Header */}
        <CardHeader
          className={cn(
            "flex items-center justify-between pb-0",
            !isSocial && "p-2",
            isSocial && "px-0 pb-1",
          )}
        >
          {isSocial ? (
            <AvatarCardHeader
              user={grow.owner}
              dateElement={dateElement}
              actions={actions}
              showActions={actions.length > 0}
            />
          ) : (
            <div className="flex w-full min-w-0 items-center justify-between gap-2">
              {/* Title Link */}
              <CardTitle as="h3" className="min-w-0">
                <Button
                  asChild
                  variant="link"
                  className="text-secondary decoration-secondary flex min-w-0 items-center justify-start gap-2 px-0"
                >
                  <Link href={`${modulePaths.PUBLICGROWS.path}/${grow.id}`}>
                    <span className="truncate text-2xl leading-normal font-semibold">
                      {grow.name}
                    </span>
                  </Link>
                </Button>
              </CardTitle>

              {/* ActionsMenu */}
              {user && user.id === grow.ownerId && actions.length > 0 && (
                <ActionsMenu actions={actions} />
              )}
            </div>
          )}
        </CardHeader>

        {/* Card Content */}
        <CardContent
          className={cn(
            "flex flex-1 flex-col px-2",
            isSocial && "ml-12 pr-2 pl-0",
          )}
        >
          <div className="flex-1">
            {/* Header Image */}
            <div className="border-accent relative aspect-video w-full overflow-hidden rounded-md border">
              {grow.headerImage ? (
                <Image
                  fill
                  sizes={RESPONSIVE_IMAGE_SIZES}
                  src={grow.headerImage.imageUrl}
                  alt={grow.name}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                />
              ) : (
                <div className="bg-muted/10 relative h-full w-full">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      fill
                      sizes={RESPONSIVE_IMAGE_SIZES}
                      src="/images/GrowAGram_Logo_big.png"
                      alt={grow.name}
                      className="h-full w-full object-cover opacity-40 transition-opacity duration-300 hover:opacity-50"
                      priority
                    />
                  </div>
                </div>
              )}
            </div>
            {/* Plants Listing */}
            <div className="mt-2 flex flex-1 flex-col">
              <div
                className={cn(
                  "custom-scrollbar max-h-72 flex-1 space-y-2 overflow-y-auto",
                  grow.plants.length > 2 && "pr-3",
                )}
              >
                <AnimatePresence>
                  {grow.plants.length ? (
                    grow.plants.map((plant) => (
                      <motion.div
                        key={plant.id}
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <EnhancedPlantCard plant={plant} />
                      </motion.div>
                    ))
                  ) : (
                    <Alert variant="destructive" className="bg-accent/20">
                      <AlertCircleIcon className="h-4 w-4" />
                      <AlertTitle>{t("no-plants-connected")}</AlertTitle>
                      <AlertDescription className="flex items-center justify-end">
                        <Button size="sm" variant="link" asChild>
                          <Link
                            href={`${modulePaths.GROWS.path}/${grow.id}/form?${currentParams.toString()}`}
                          >
                            {t("button-label-connect-plants")}
                            <ArrowRightIcon className="h-4 w-4" />
                          </Link>
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Date Information - Moved above footer content */}
          <EntityDateInfo
            createdAt={grow.createdAt}
            updatedAt={grow.updatedAt}
          />
        </CardContent>
        {/* Card Footer */}
        <CardFooter className={cn("p-2", isSocial && "ml-12")}>
          {!isSocial && (
            <Button
              size={"sm"}
              variant="primary"
              className="group flex w-full transform items-center justify-center gap-2 rounded-sm p-2 font-semibold transition-all hover:translate-y-[-1px] hover:shadow-md"
              onClick={() => setIsPostModalOpen(true)}
            >
              <MessageSquareTextIcon
                size={20}
                className="transition-transform duration-300 group-hover:scale-110"
              />
              <span className="transition-colors duration-300">
                {t("button-label-post-update")}
              </span>
            </Button>
          )}

          {isSocial && (
            <SocialCardFooter
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
          )}
        </CardFooter>

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
