"use client";

// src/components/features/Chat/chat-button.tsx
import { MessageCircle } from "lucide-react";
import { useState } from "react";

import { ChatModal } from "~/components/features/Chat/chat-modal";
import { Button } from "~/components/ui/button";

export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="ghost" size="icon">
        <MessageCircle className="h-5 w-5" />
      </Button>
      <ChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
