// src/app/api/trpc/[trpc]/route.ts:
import type { NextRequest } from "next/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { TRPC_ENDPOINT } from "~/assets/constants";
import { appRouter as router } from "~/server/api/root";
import { createTRPCContext as createContext } from "~/server/api/trpc";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    req,
    router,
    createContext,
    endpoint: TRPC_ENDPOINT,
    onError({ path, error }) {
      console.error(
        `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
      );
    },
  });

export { handler as GET, handler as POST };
