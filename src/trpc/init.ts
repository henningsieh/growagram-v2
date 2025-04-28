import { cache } from "react";
import { TRPCError, initTRPC } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { UserRoles } from "~/types/user";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.^
 *
 * @see https://trpc.io/docs/v11/context
 */
export const createTRPCContext = cache(
  async (opts?: FetchCreateContextFnOptions) => {
    // Provide safe defaults for server components
    const req = opts?.req ?? undefined;
    const resHeaders = opts?.resHeaders ?? new Headers();
    const info = opts?.info ?? {};

    const session = await auth();

    console.log("createContext for", session?.user?.name ?? "unknown user");

    return {
      req,
      resHeaders,
      info,
      db,
      session,
      ...opts,
    };
  },
);

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.

const t = initTRPC.context<TRPCContext>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,

  /**
   * @see https://trpc.io/docs/v11/error-formatting
   */
  errorFormatter({ shape }) {
    return shape;
  },
  sse: {
    maxDurationMs: 5 * 60 * 1_000, // 5 minutes
    ping: {
      enabled: true,
      intervalMs: 3_000,
    },
    client: {
      reconnectAfterInactivityMs: 5_000,
    },
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 *
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/v11/router
 */
// Base router and procedure helpers
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (process.env.NODE_ENV === "development") {
    const randomNumber = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    const delay = randomNumber(20, 50);
    console.debug(
      "🚩 doing artificial delay of",
      delay,
      "ms before returning",
      path,
    );

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  const result = await next();
  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 * @see https://trpc.io/docs/v11/procedures
 **/
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = publicProcedure.use(async (opts) => {
  const session = opts.ctx.session;

  if (!session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Ensure user.name is not undefined
  if (!session.user.name) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Username is required",
    });
  }

  return opts.next({
    ctx: {
      ...opts.ctx,
      session: {
        ...session,
        user: {
          ...session.user,
          name: session.user.name, // This ensures name is string | null, not undefined
        },
      },
    },
  });
});

/**
 * Admin procedure
 *
 * This procedure ensures that only users with the ADMIN role can access the endpoint.
 * It builds on the protectedProcedure to first check if the user is logged in.
 */
export const adminProcedure = protectedProcedure.use(function isAdmin(opts) {
  const { user } = opts.ctx.session;

  // Check if the user has the ADMIN role
  if (user.role !== UserRoles.ADMIN) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Only administrators can access this resource",
    });
  }

  return opts.next({
    ctx: opts.ctx,
  });
});
