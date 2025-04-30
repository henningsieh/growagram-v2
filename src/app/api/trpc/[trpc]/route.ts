// src/app/api/trpc/[trpc]/route.ts:
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { TRPC_ENDPOINT } from "~/assets/constants";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/trpc/init";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: TRPC_ENDPOINT,
    req,
    router: appRouter,
    createContext: createTRPCContext,
    onError({ path, error }) {
      console.error(
        `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
      );
    },
  });
export { handler as GET, handler as POST };
