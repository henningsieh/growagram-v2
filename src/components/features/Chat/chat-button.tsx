"use client";

// src/components/features/Chat/chat-button.tsx
import * as React from "react";
import { MessageCircleIcon } from "lucide-react";
import { ChatModal } from "~/components/features/Chat/chat-modal";
import { Button } from "~/components/ui/button";

export function ChatButton() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" size="icon">
        <MessageCircleIcon strokeWidth={1.8} className="size-6" />
        <span className="sr-only">{"Chat"}</span>
      </Button>
      <ChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
