"use client";

// src/components/features/Chat/chat-button.tsx
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";

import { ChatModal } from "./chat-modal";

export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 rounded-full"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
      <ChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
