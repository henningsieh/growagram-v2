// src/trpc/server.ts:
import { cache } from "react";
// import { createTRPCClient, httpLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import "server-only";
import { createTRPCContext } from "~/lib/trpc/init";
import { makeQueryClient } from "~/lib/trpc/query-client";
import { appRouter } from "../../server/api/root";

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient);
export const trpc = createTRPCOptionsProxy({
  ctx: async () => createTRPCContext(),
  router: appRouter,
  queryClient: getQueryClient,
});
// If your router is on a separate server, pass a client:
// createTRPCOptionsProxy({
//   client: createTRPCClient({
//     links: [httpLink({ url: "..." })],
//   }),
//   queryClient: getQueryClient,
// });

export const caller = appRouter.createCaller(createTRPCContext);
