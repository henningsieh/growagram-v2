// src/trpc/server.tsx:
import { cache } from "react";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import "server-only";
import { appRouter } from "../server/api/root";
import { createTRPCContext } from "./init";
import { createQueryClient } from "./query-client";

// IMPORTANT:
// Create a stable getter for the query client that will return the same client during the same request.
export const getQueryClient = cache(createQueryClient);

// This is the client-side TRPC provider
export const trpc = createTRPCOptionsProxy({
  ctx: async () => createTRPCContext(),
  router: appRouter,
  queryClient: getQueryClient,
});

// ✅ NEW: create a function instead of static export
export const getCaller = async () => {
  const context = await createTRPCContext();
  return appRouter.createCaller(context);
};
