// src/lib/trpc/server.ts:
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";
import "server-only";
import { type AppRouter, createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

import { createQueryClient } from "./query-client";

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createTRPCContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
);
