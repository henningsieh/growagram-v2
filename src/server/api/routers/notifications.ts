// src/server/api/routers/notifications.ts:
import { and, count, desc, eq } from "drizzle-orm";
import EventEmitter, { on } from "node:events";
import { z } from "zod";
import { notifications } from "~/lib/db/schema";
import { ServerSideNotificationService } from "~/lib/notifications/server-side";
import { createTRPCRouter, protectedProcedure } from "~/lib/trpc/init";
import { NotificationEvent } from "~/types/notification";

interface NotificationEvents {
  notification: (data: NotificationEvent) => void;
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
        // Only log real errors, not abortion
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Notification subscription error:", { err });
        }
      }
    }),

  getAll: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          page: z.number().min(1).optional(),
          cursor: z.string().nullish(),
          onlyUnread: z.boolean().default(false),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const page = input?.page ?? 1;
      const onlyUnread = input?.onlyUnread ?? false;

      // Extract locale from request headers (fallback to 'en')
      const acceptLanguage = ctx.req?.headers.get("accept-language");
      const locale = acceptLanguage?.startsWith("de") ? "de" : "en";

      // Calculate offset based on page number (like in grows)
      const offset = (page - 1) * limit;

      let whereConditions = and(eq(notifications.userId, ctx.session.user.id));

      // Add read status filter if onlyUnread is true
      if (onlyUnread) {
        whereConditions = and(whereConditions, eq(notifications.read, false));
      }

      // Get total count for pagination
      const totalCountResult = await ctx.db
        .select({ count: count() })
        .from(notifications)
        .where(whereConditions)
        .then((result) => result[0]?.count || 0);

      // Get paginated results based on offset
      const rawResults = await ctx.db.query.notifications.findMany({
        orderBy: [desc(notifications.createdAt)],
        where: whereConditions,
        columns: {
          actorId: false,
        },
        with: {
          actor: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        limit: limit,
        offset: offset,
      });

      // Enrich notifications with computed text and href server-side
      const enrichedResults = await Promise.all(
        rawResults.map(async (notification) => {
          const [notificationText, notificationHref] = await Promise.all([
            ServerSideNotificationService.generateNotificationText(
              notification.type,
              notification.entityType,
              locale,
            ),
            ServerSideNotificationService.generateNotificationHref(
              notification.entityType,
              notification.entityId,
              notification.commentId ?? undefined,
            ),
          ]);

          return {
            ...notification,
            // Add computed fields
            notificationText,
            notificationHref,
          };
        }),
      );

      const totalCount = Number(totalCountResult);
      const totalPages = Math.ceil(totalCount / limit);

      return {
        items: enrichedResults,
        page,
        nextPage: page < totalPages ? page + 1 : undefined,
        totalPages,
        totalCount,
      };
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
