// src/components/features/Chat/chat-modal.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Send, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { api } from "~/lib/trpc/react";

// src/components/features/Chat/chat-modal.tsx

// src/components/features/Chat/chat-modal.tsx

// src/components/features/Chat/chat-modal.tsx

export function ChatModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const utils = api.useUtils();

  // Query for initial messages
  const { data: messages } = api.chat.getMessages.useQuery();

  // Subscribe to new messages
  api.chat.onMessage.useSubscription(undefined, {
    onData: (message) => {
      utils.chat.getMessages.setData(undefined, (prev) => {
        if (!prev) return [message];
        return [message, ...prev];
      });
    },
  });

  // Send message mutation
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

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  console.debug("Rendering ChatModal");
  console.debug("messages", messages);

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
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Chat</CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col">
            <ScrollArea ref={scrollRef} className="flex-1 pr-4">
              <div className="flex flex-col-reverse gap-4">
                {messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${
                      msg.senderId === session?.user.id
                        ? "flex-row-reverse"
                        : ""
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.sender.image || undefined} />
                      <AvatarFallback>
                        {msg.sender.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-lg px-3 py-2 ${
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
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
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
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
