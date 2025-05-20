// src/server/api/routers/chat.ts
import EventEmitter from "events";
import { z } from "zod";
import { chatMessages } from "~/lib/db/schema";
import { protectedProcedure } from "~/lib/trpc/init";
import type { ChatMessage } from "~/types/chat";

const ee = new EventEmitter();

export const chatRouter = {
  // Send a message
  sendMessage: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [message] = await ctx.db
        .insert(chatMessages)
        .values({
          content: input.content,
          senderId: ctx.session.user.id,
        })
        .returning();

      // Create complete message with sender before emitting
      const completeMessage: ChatMessage = {
        ...message,
        sender: {
          id: ctx.session.user.id,
          name: ctx.session.user.name ?? null,
          image: ctx.session.user.image ?? null,
        },
      };

      ee.emit("sendMessage", completeMessage);
      return completeMessage;
    }),

  // Get recent messages
  getMessages: protectedProcedure.query(async ({ ctx }) => {
    const messages = await ctx.db.query.chatMessages.findMany({
      orderBy: (messages, { desc }) => [desc(messages.createdAt)],
      limit: 50,
      with: {
        sender: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return messages.map((msg) => ({
      ...msg,
      sender: msg.sender ?? {
        id: msg.senderId,
        name: null,
        image: null,
      },
    }));
  }),

  // Subscribe to new messages
  onMessage: protectedProcedure.subscription(async function* () {
    let disposed = false;

    const messages = new AsyncIterableQueue<ChatMessage>();

    const onMessage = (message: ChatMessage) => {
      if (!disposed) messages.push(message);
    };

    ee.on("sendMessage", onMessage);

    try {
      while (!disposed) {
        yield await messages.next();
      }
    } finally {
      disposed = true;
      ee.off("sendMessage", onMessage);
    }
  }),
};

// Helper class for async iteration
class AsyncIterableQueue<T> {
  private queue: T[] = [];
  private resolveNext: ((value: T) => void) | null = null;

  push(item: T) {
    if (this.resolveNext) {
      this.resolveNext(item);
      this.resolveNext = null;
    } else {
      this.queue.push(item);
    }
  }

  async next(): Promise<T> {
    if (this.queue.length > 0) {
      return this.queue.shift()!;
    }
    return new Promise((resolve) => {
      this.resolveNext = resolve;
    });
  }
}
