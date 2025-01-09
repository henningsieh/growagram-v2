"use client";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import { Send, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { api } from "~/lib/trpc/react";
import { cn } from "~/lib/utils";

export function ChatModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const utils = api.useUtils();

  const { data: messages } = api.chat.getMessages.useQuery();

  api.chat.onMessage.useSubscription(undefined, {
    onData: (message) => {
      utils.chat.getMessages.setData(undefined, (prev) => {
        if (!prev) return [message];
        return [message, ...prev];
      });
    },
  });

  const sendMessageMutation = api.chat.sendMessage.useMutation();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessageMutation.mutateAsync({ content: message });
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  useEffect(() => {
    if (scrollViewportRef.current) {
      const scrollContainer = scrollViewportRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

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
          </CardHeader>

          <CardContent className="flex-1 p-0">
            <ScrollAreaPrimitive.Root
              type="auto"
              className="h-[calc(600px-8rem)]"
            >
              <ScrollAreaPrimitive.Viewport
                ref={scrollViewportRef}
                className="h-full w-full"
              >
                <div className="flex flex-col-reverse gap-4 p-4">
                  {messages?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${
                        msg.senderId === session?.user.id
                          ? "flex-row-reverse"
                          : ""
                      }`}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={msg.sender.image || undefined} />
                        <AvatarFallback>
                          {msg.sender.name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`max-w-[75%] break-words rounded-lg px-3 py-2 ${
                          msg.senderId === session?.user.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollAreaPrimitive.Viewport>
              <ScrollAreaPrimitive.Scrollbar
                orientation="vertical"
                className={cn(
                  "flex touch-none select-none bg-muted transition-colors",
                  "h-full w-2.5 border-l border-l-transparent p-[1px]",
                )}
              >
                <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-border" />
              </ScrollAreaPrimitive.Scrollbar>
            </ScrollAreaPrimitive.Root>
          </CardContent>

          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
