import { observable } from "@trpc/server/observable";
import { and, eq } from "drizzle-orm";
import EventEmitter from "events";
import { z } from "zod";
import { notifications } from "~/lib/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const ee = new EventEmitter();

export const notificationRouter = createTRPCRouter({
  onNotification: protectedProcedure.subscription(() => {
    return observable<Notification>((emit) => {
      const onNotification = (notification: Notification) => {
        emit.next(notification);
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
        actor: true,
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
