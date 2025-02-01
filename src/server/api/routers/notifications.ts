import { observable } from "@trpc/server/observable";
import { and, eq } from "drizzle-orm";
import EventEmitter from "events";
import { z } from "zod";
import { notifications } from "~/lib/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const ee = new EventEmitter();

export const notificationRouter = createTRPCRouter({
  onNotification: protectedProcedure.subscription(({ ctx }) => {
    return observable<{
      type: string;
      id: string;
      createdAt: Date;
      userId: string;
      actorId: string;
      read: boolean;
      actor: {
        id: string;
        name: string | null;
        image: string | null;
      };
    }>((emit) => {
      const onNotification = (notification: {
        type: string;
        id: string;
        createdAt: Date;
        userId: string;
        actorId: string;
        read: boolean;
        actor: {
          id: string;
          name: string | null;
          image: string | null;
        };
      }) => {
        // Only emit if notification is for current user
        if (notification.userId === ctx.session.user.id) {
          emit.next(notification);
        }
      };

      ee.on("notification", onNotification);

      return () => {
        ee.off("notification", onNotification);
      };
    });
  }),

  getUnread: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.notifications.findMany({
      where: (notification) =>
        and(
          eq(notification.userId, ctx.session.user.id),
          eq(notification.read, false),
        ),
      with: {
        actor: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
  }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(notifications)
        .set({ read: true })
        .where(eq(notifications.id, input.id));
    }),
});

// Export emitter for use in other routers
export const notificationEmitter = ee;
