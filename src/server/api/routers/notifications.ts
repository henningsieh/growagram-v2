import { and, eq } from "drizzle-orm";
import EventEmitter, { on } from "node:events";
import { z } from "zod";
import { notifications } from "~/lib/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export type NotificationType = {
  id: string;
  type: string;
  createdAt: Date;
  userId: string;
  actorId: string;
  read: boolean;
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
        lastEventId: z.string().nullish(),
      }),
    )
    .subscription(async function* (opts) {
      console.debug(
        "Starting notification subscription for user:",
        opts.ctx.session.user.id,
      );

      const iterable = ee.toIterable("notification", {
        signal: opts.signal,
      });

      // Get last notification timestamp if reconnecting
      const lastNotificationTime = await (async () => {
        const lastEventId = opts.input?.lastEventId;
        if (!lastEventId) return null;

        const notification = await opts.ctx.db.query.notifications.findFirst({
          where: (fields) => eq(fields.id, lastEventId),
        });
        return notification?.createdAt ?? null;
      })();

      // Get any notifications we missed
      const missedNotifications =
        await opts.ctx.db.query.notifications.findMany({
          where: (fields) =>
            and(
              eq(fields.userId, opts.ctx.session.user.id),
              lastNotificationTime ? and(eq(fields.read, false)) : undefined,
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
          orderBy: (fields, { asc }) => [asc(fields.createdAt)],
        });

      console.debug("Found missed notifications:", missedNotifications.length);

      // Yield missed notifications first
      for (const notification of missedNotifications) {
        yield notification;
      }

      // Then yield new notifications as they come in
      try {
        console.debug("Starting to listen for new notifications");
        for await (const [notification] of iterable) {
          console.debug("Received notification event:", notification);
          if (notification.userId === opts.ctx.session.user.id) {
            console.debug("Yielding notification to client:", notification);
            yield notification;
          }
        }
      } catch (err) {
        // Log error but don't throw to allow reconnection
        console.error("Notification subscription error:", err);
      }
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
