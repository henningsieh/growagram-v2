"use client";

// src/components/features/Chat/chat-button.tsx
import * as React from "react";

import { MessageCircleIcon } from "lucide-react";

import { Button } from "~/components/ui/button";

import { ChatModal } from "~/components/features/Chat/chat-modal";

export function ChatButton() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="ghost" size="icon">
        <MessageCircleIcon strokeWidth={1.8} className="size-6" />
        <span className="sr-only">{"Chat"}</span>
      </Button>
      <ChatModal isOpen={isOpen} onCloseAction={() => setIsOpen(false)} />
    </>
  );
}
