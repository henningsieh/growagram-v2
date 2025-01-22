"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Send, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CustomAvatar from "~/components/atom/custom-avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { EnhancedScrollArea } from "~/components/ui/enhanced-scroll-area";
import { Input } from "~/components/ui/input";
import { api } from "~/lib/trpc/react";

export function ChatModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const utils = api.useUtils();

  const { data: messages } = api.chat.getMessages.useQuery(undefined, {
    enabled: status === "authenticated" && isOpen, // Only fetch messages when user is authenticated and modal is open
  });

  // Enhanced subscription with error handling
  api.chat.onMessage.useSubscription(undefined, {
    onData: (message) => {
      utils.chat.getMessages.setData(undefined, (prev) => {
        if (!prev) return [message];
        return [message, ...prev];
      });
    },
    enabled: isOpen,
    onError: (error) => {
      console.error("Subscription error:", error);
    },
  });

  // Add this effect to handle cleanup when the modal closes
  useEffect(() => {
    return () => {
      if (!isOpen) {
        utils.chat.getMessages.reset();
      }
    };
  }, [isOpen, utils.chat.getMessages]);

  const sendMessageMutation = api.chat.sendMessage.useMutation({
    onError: (err) => {
      console.error("Failed to send message:", err);
      setError("Failed to send message. Please try again.");
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setError(null);
    try {
      await sendMessageMutation.mutateAsync({ content: message });
      setMessage("");
    } catch (error) {
      // Error handling is managed by mutation onError callback
    }
  };

  // Cleanup subscription when modal closes
  useEffect(() => {
    return () => {
      if (!isOpen) {
        utils.chat.getMessages.reset();
      }
    };
  }, [isOpen, utils.chat.getMessages]);

  useEffect(() => {
    if (isOpen && scrollViewportRef.current) {
      const scrollContainer = scrollViewportRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={onClose}
      >
        <Card
          className="flex h-[600px] w-[400px] flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="border-b p-4">
            <div className="flex items-center justify-between">
              <CardTitle>Chat</CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
          </CardHeader>

          <CardContent className="flex-1 p-0">
            <EnhancedScrollArea
              viewportRef={scrollViewportRef}
              className="h-[calc(600px-8rem)]"
            >
              <div className="flex flex-col-reverse gap-4 p-4">
                {messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-center gap-2 ${
                      msg.senderId === session?.user.id
                        ? "flex-row-reverse"
                        : ""
                    }`}
                  >
                    <CustomAvatar
                      src={msg.sender.image ?? undefined}
                      alt={msg.sender.name ?? "User avatar"}
                      fallback={msg.sender.name?.[0] || "?"}
                      size={40}
                    />
                    <div
                      className={`max-w-[75%] break-words rounded-sm px-4 py-2 ${
                        msg.senderId === session?.user.id
                          ? "bg-muted text-muted-foreground"
                          : "bg-accent text-accent-foreground"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </EnhancedScrollArea>
          </CardContent>

          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
                disabled={sendMessageMutation.isPending}
              />
              <Button
                type="submit"
                size="icon"
                disabled={sendMessageMutation.isPending}
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
