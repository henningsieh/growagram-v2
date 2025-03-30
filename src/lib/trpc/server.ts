// src/lib/trpc/server.ts:
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";
import "server-only";

import { createQueryClient } from "~/lib/trpc/query-client";
import { type AppRouter, createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createTRPCContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
);
