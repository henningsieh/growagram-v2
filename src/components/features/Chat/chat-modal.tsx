"use client";

import * as React from "react";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

import { useSubscription } from "@trpc/tanstack-react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MessageCircleIcon, Send, X } from "lucide-react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";

import { CustomAvatar } from "~/components/atom/custom-avatar";
import SpinningLoader from "~/components/atom/spinning-loader";

import { useTRPC } from "~/lib/trpc/client";

export function ChatModal({
  isOpen,
  onCloseAction,
}: {
  isOpen: boolean;
  onCloseAction: () => void;
}) {
  const { data: session, status } = useSession();
  const [message, setMessage] = React.useState("");
  const t = useTranslations("Chat");
  // Ref for the ScrollArea root element
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const {
    data: messages,
    error: queryError,
    isLoading,
  } = useQuery(
    trpc.chat.getMessages.queryOptions(undefined, {
      // enabled: status === "authenticated" && isOpen,
      enabled: status === "authenticated",
      // Always fetch messages when authenticated, regardless of modal state
      // This ensures messages are ready when modal is opened
    }),
  );

  useSubscription(
    trpc.chat.onMessage.subscriptionOptions(undefined, {
      onData: (message) => {
        queryClient.setQueryData(
          trpc.chat.getMessages.queryKey(undefined),
          (prev: typeof messages) => {
            if (!prev) return [message];
            return [message, ...prev];
          },
        );
      },
      enabled: isOpen && status === "authenticated",
      onError: (error) => {
        console.error("Subscription error:", error);
      },
    }),
  );

  React.useEffect(() => {
    if (!isOpen) {
      void queryClient.invalidateQueries({
        queryKey: trpc.chat.getMessages.queryKey(undefined),
      });
    }
  }, [isOpen, queryClient, trpc.chat.getMessages]);

  const sendMessageMutation = useMutation(
    trpc.chat.sendMessage.mutationOptions({
      onMutate: async (newMessage) => {
        await queryClient.cancelQueries({
          queryKey: trpc.chat.getMessages.queryKey(undefined),
        });

        const previousMessages = queryClient.getQueryData(
          trpc.chat.getMessages.queryKey(undefined),
        );

        queryClient.setQueryData(
          trpc.chat.getMessages.queryKey(undefined),
          (old: typeof messages | undefined) => {
            const optimisticMessage = {
              id: `optimistic-${Date.now()}`, // Temporary ID
              content: newMessage.content,
              senderId: session?.user.id ?? "unknown",
              createdAt: new Date(),
              sender: {
                id: session?.user.id ?? "unknown",
                name: session?.user.name ?? "You",
                image: session?.user.image ?? null,
              },
            };
            return old ? [optimisticMessage, ...old] : [optimisticMessage];
          },
        );

        return { previousMessages };
      },
      onError: (err, newMessage, context) => {
        queryClient.setQueryData(
          trpc.chat.getMessages.queryKey(undefined),
          context?.previousMessages,
        );
        // Replace error state with toast
        toast.error(t("error.send-failed"));
      },
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.chat.getMessages.queryKey(undefined),
        });
      },
    }),
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !session?.user) return; // Ensure user is logged in

    setMessage(""); // Clear input immediately for better UX

    try {
      await sendMessageMutation.mutateAsync({ content: message });
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessage(message); // Restore message on error
    }
  };

  // Scroll to bottom effect using the root ref
  React.useEffect(() => {
    if (isOpen && scrollAreaRef.current) {
      // Find the viewport element using the data attribute
      const viewportElement =
        scrollAreaRef.current.querySelector<HTMLDivElement>(
          '[data-slot="scroll-area-viewport"]', // Use the correct data-slot selector
        );
      if (viewportElement) {
        // Use requestAnimationFrame for smoother scrolling after render
        requestAnimationFrame(() => {
          viewportElement.scrollTop = viewportElement.scrollHeight;
        });
      }
    }
  }, [messages, isOpen]); // Rerun when messages update or modal opens

  // Add escape key listener
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseAction();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onCloseAction]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} // Simpler initial animation
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }} // Faster transition
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onCloseAction}
      >
        <Card
          className="grid h-[80vh] max-h-[700px] w-[90vw] max-w-[450px] grid-rows-[auto_1fr_auto] overflow-hidden rounded-lg shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="flex flex-row items-center justify-between border-b px-4 [.border-b]:pb-3">
            <CardTitle
              as="h2"
              className="font-grandstander flex flex-row text-2xl font-semibold"
            >
              {t("title")}
              <MessageCircleIcon strokeWidth={3.5} className="ml-3 size-6" />
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCloseAction}
              className="h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>

          {/* Show query error from tanstack instead of local error state */}
          {queryError && (
            <div className="bg-destructive/10 text-destructive border-b p-2 text-center text-sm">
              {queryError.message}
            </div>
          )}

          {/* Main content area */}
          <div className="min-h-0">
            <ScrollArea ref={scrollAreaRef} className="h-full">
              <CardContent className="p-4">
                {/* Messages container */}
                <div className="flex flex-col-reverse gap-4">
                  {status === "authenticated" && (
                    <>
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2 py-4">
                          <SpinningLoader className="text-muted-foreground size-5 animate-spin" />
                          <span className="text-muted-foreground font-mono text-xl font-bold tracking-tight">
                            {t("messages-are-loading")}
                          </span>
                        </div>
                      ) : !messages?.length ? (
                        <p className="text-muted-foreground py-4 text-center text-sm">
                          {t("no-messages")}
                        </p>
                      ) : null}
                    </>
                  )}
                  {status === "authenticated" &&
                    messages?.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-start gap-3 ${
                          msg.senderId === session?.user.id
                            ? "flex-row-reverse"
                            : "flex-row"
                        }`}
                      >
                        <CustomAvatar
                          src={msg.sender.image ?? undefined}
                          alt={msg.sender.name ?? "User"}
                          fallback={msg.sender.name?.[0]?.toUpperCase() || "?"}
                          size={32}
                          className="mt-1 shrink-0"
                        />
                        <div
                          className={`max-w-[75%] rounded-lg px-3 py-1 text-sm break-words ${
                            msg.senderId === session?.user.id
                              ? "bg-accent text-accent-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </motion.div>
                    ))}
                  {status === "unauthenticated" && (
                    <p className="text-muted-foreground py-4 text-center text-sm">
                      {t("please-login")}
                    </p>
                  )}
                </div>
              </CardContent>
            </ScrollArea>
          </div>

          {/* Footer */}
          <CardFooter className="border-t">
            <form
              onSubmit={handleSendMessage}
              className="flex w-full items-center gap-2"
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  status === "authenticated"
                    ? t("input.placeholder.authenticated")
                    : t("input.placeholder.unauthenticated")
                }
                className="flex-1"
                disabled={
                  sendMessageMutation.isPending || status !== "authenticated"
                }
                autoComplete="off"
              />
              <Button
                type="submit"
                size="icon"
                disabled={
                  sendMessageMutation.isPending ||
                  !message.trim() ||
                  status !== "authenticated"
                }
                aria-label="Send message"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
