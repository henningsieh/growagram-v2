import type { TRPCRouterRecord } from "@trpc/server";
import EventEmitter, { on } from "node:events";
import { z } from "zod";
import { db } from "~/lib/db";
import type { PostType } from "~/lib/db/schema";
import { Channel } from "~/lib/db/schema";
import { protectedProcedure, publicProcedure } from "~/server/api/trpc";

export type WhoIsTyping = Record<string, { lastTyped: Date }>;

export interface MyEvents {
  add: (channelId: string, data: PostType) => void;
  isTypingUpdate: (channelId: string, who: WhoIsTyping) => void;
}
// First, define the interface with a different name
interface EventEmitterInterface {
  on<TEv extends keyof MyEvents>(event: TEv, listener: MyEvents[TEv]): this;
  off<TEv extends keyof MyEvents>(event: TEv, listener: MyEvents[TEv]): this;
  once<TEv extends keyof MyEvents>(event: TEv, listener: MyEvents[TEv]): this;
  emit<TEv extends keyof MyEvents>(
    event: TEv,
    ...args: Parameters<MyEvents[TEv]>
  ): boolean;
}

// Then have the class implement the interface
class MyEventEmitter extends EventEmitter implements EventEmitterInterface {
  public toIterable<TEv extends keyof MyEvents>(
    event: TEv,
    opts: NonNullable<Parameters<typeof on>[2]>,
  ): AsyncIterable<Parameters<MyEvents[TEv]>> {
    return on(this, event, opts) as unknown as never;
  }

  // Implement the interface methods
  on<TEv extends keyof MyEvents>(event: TEv, listener: MyEvents[TEv]): this {
    return super.on(event, listener);
  }

  off<TEv extends keyof MyEvents>(event: TEv, listener: MyEvents[TEv]): this {
    return super.off(event, listener);
  }

  once<TEv extends keyof MyEvents>(event: TEv, listener: MyEvents[TEv]): this {
    return super.once(event, listener);
  }

  emit<TEv extends keyof MyEvents>(
    event: TEv,
    ...args: Parameters<MyEvents[TEv]>
  ): boolean {
    return super.emit(event, ...args);
  }
}

// In a real app, you'd probably use Redis or something
export const ee = new MyEventEmitter();

// who is currently typing for each channel, key is `name`
export const currentlyTyping: Record<string, WhoIsTyping> = Object.create(
  null,
) as Record<string, WhoIsTyping>;

// every 1s, clear old "isTyping"
setInterval(() => {
  const updatedChannels = new Set<string>();
  const now = Date.now();
  for (const [channelId, typers] of Object.entries(currentlyTyping)) {
    for (const [key, value] of Object.entries(typers ?? {})) {
      if (now - value.lastTyped.getTime() > 3e3) {
        delete typers[key];
        updatedChannels.add(channelId);
      }
    }
  }
  updatedChannels.forEach((channelId) => {
    ee.emit("isTypingUpdate", channelId, currentlyTyping[channelId] ?? {});
  });
}, 3e3).unref();

export const channelRouter = {
  list: publicProcedure.query(() => {
    return db.query.Channel.findMany();
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().trim().min(2) }))
    .mutation(async ({ input }) => {
      const [channel] = await db
        .insert(Channel)
        .values({
          name: input.name,
        })
        .returning();

      return channel.id;
    }),

  isTyping: protectedProcedure
    .input(z.object({ channelId: z.string().uuid(), typing: z.boolean() }))
    .mutation((opts) => {
      const { name } = opts.ctx.session.user;
      const { channelId } = opts.input;

      if (!currentlyTyping[channelId]) {
        currentlyTyping[channelId] = {};
      }

      if (!opts.input.typing) {
        delete currentlyTyping[channelId][name];
      } else {
        currentlyTyping[channelId][name] = {
          lastTyped: new Date(),
        };
      }
      ee.emit("isTypingUpdate", channelId, currentlyTyping[channelId]);
    }),

  whoIsTyping: publicProcedure
    .input(
      z.object({
        channelId: z.string().uuid(),
      }),
    )
    .subscription(async function* (opts) {
      const { channelId } = opts.input;

      let lastIsTyping = "";

      /**
       * yield who is typing if it has changed
       * won't yield if it's the same as last time
       */
      function* maybeYield(who: WhoIsTyping) {
        const idx = Object.keys(who).toSorted().toString();
        if (idx === lastIsTyping) {
          return;
        }
        yield Object.keys(who);

        lastIsTyping = idx;
      }

      // emit who is currently typing
      yield* maybeYield(currentlyTyping[channelId] ?? {});

      for await (const [channelId, who] of ee.toIterable("isTypingUpdate", {
        signal: opts.signal,
      })) {
        if (channelId === opts.input.channelId) {
          yield* maybeYield(who);
        }
      }
    }),
} satisfies TRPCRouterRecord;
