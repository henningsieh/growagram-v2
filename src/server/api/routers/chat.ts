// src/server/api/routers/chat.ts
import { observable } from "@trpc/server/observable";
import EventEmitter from "events";
import { z } from "zod";
import { chatMessages } from "~/lib/db/schema";
import { ChatMessage } from "~/types/chat";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const ee = new EventEmitter();

export const chatRouter = createTRPCRouter({
  // Send a message
  sendMessage: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const message = await ctx.db
        .insert(chatMessages)
        .values({
          content: input.content,
          senderId: ctx.session.user.id,
        })
        .returning();

      // Create complete message with sender before emitting
      const completeMessage: ChatMessage = {
        ...message[0],
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
  onMessage: protectedProcedure.subscription(() => {
    return observable<ChatMessage>((emit) => {
      const onMessage = (message: ChatMessage) => {
        emit.next(message);
      };

      ee.on("sendMessage", onMessage);
      return () => {
        ee.off("sendMessage", onMessage);
      };
    });
  }),
});
