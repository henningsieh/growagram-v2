import { and, desc, eq } from "drizzle-orm";
import EventEmitter, { on } from "node:events";
import { z } from "zod";
import { notifications } from "~/lib/db/schema";
import {
  NotifiableEntityType,
  NotificationEventType,
} from "~/types/notification";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export type NotificationType = {
  id: string;
  createdAt: Date;
  userId: string;
  type: NotificationEventType;
  entityType: NotifiableEntityType;
  entityId: string;
  actor: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

export interface NotificationEvents {
  notification: (data: NotificationType) => void;
}

// Create typed EventEmitter interface
interface EventEmitterInterface {
  on<TEv extends keyof NotificationEvents>(
    event: TEv,
    listener: NotificationEvents[TEv],
  ): this;
  off<TEv extends keyof NotificationEvents>(
    event: TEv,
    listener: NotificationEvents[TEv],
  ): this;
  once<TEv extends keyof NotificationEvents>(
    event: TEv,
    listener: NotificationEvents[TEv],
  ): this;
  emit<TEv extends keyof NotificationEvents>(
    event: TEv,
    ...args: Parameters<NotificationEvents[TEv]>
  ): boolean;
}

// Implement typed EventEmitter
class NotificationEventEmitter
  extends EventEmitter
  implements EventEmitterInterface
{
  public toIterable<TEv extends keyof NotificationEvents>(
    event: TEv,
    opts: NonNullable<Parameters<typeof on>[2]>,
  ): AsyncIterable<Parameters<NotificationEvents[TEv]>> {
    return on(this, event, opts) as unknown as never;
  }
}

export const ee = new NotificationEventEmitter();

export const notificationRouter = createTRPCRouter({
  onNotification: protectedProcedure
    .input(
      z.object({
        lastEventId: z.string().nullable().optional(),
      }),
    )
    .subscription(async function* (opts) {
      const iterable = ee.toIterable("notification", {
        signal: opts.signal,
      });

      try {
        for await (const [notification] of iterable) {
          if (notification.userId === opts.ctx.session.user.id) {
            yield notification;
          }
        }
      } catch (err) {
        console.error("Notification subscription error:", err);
      }
    }),

  getUnread: protectedProcedure.query(async ({ ctx }) => {
    const results = await ctx.db.query.notifications.findMany({
      orderBy: [desc(notifications.createdAt)],
      where: (notification) =>
        and(
          eq(notification.userId, ctx.session.user.id),
          eq(notification.read, false),
        ),
      columns: {
        actorId: false,
      },
      with: {
        actor: {
          columns: {
            id: true,
            name: true,
            // username: true,
            image: true,
          },
        },
      },
    });

    // console.debug("getUnread query results:", results);
    return results;
  }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(notifications)
        .set({ read: true })
        .where(eq(notifications.id, input.id));
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    return ctx.db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, ctx.session.user.id));
  }),
});

// Export emitter for use in other routers
export const notificationEmitter = ee;
