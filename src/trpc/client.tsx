"use client";

// ^-- to make sure we can mount the Provider from a server component
import { useState } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createTRPCClient,
  httpBatchLink,
  httpSubscriptionLink,
  loggerLink,
  splitLink,
} from "@trpc/client";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import superjson from "superjson";
import type { AppRouter } from "../server/api/root";
import { createQueryClient } from "./query-client";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

/**

Inference helper for inputs.
@example type HelloInput = RouterInputs['example']['hello']
*/
export type RouterInput = inferRouterInputs<AppRouter>;
/**

Inference helper for outputs.
@example type HelloOutput = RouterOutputs['example']['hello']
*/
export type RouterOutput = inferRouterOutputs<AppRouter>;

let browserQueryClient: QueryClient;
function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  }
  // Browser: make a new query client if we don't already have one
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  if (!browserQueryClient) browserQueryClient = createQueryClient();
  return browserQueryClient;
}
function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") return "";
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
  })();
  return `${base}/api/trpc`;
}
export function TRPCReactProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>,
) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        // adds pretty logs to your console in development and logs errors in production
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        // Remove the standalone httpBatchLink and just use the splitLink
        splitLink({
          // The split link is used to send queries and mutations to the correct endpoint
          // based on the operation type. This is useful if you have a separate endpoint
          // for queries and mutations.
          // For example, if you have a separate endpoint for subscriptions, you can use
          // the split link to send subscriptions to that endpoint.
          // See https://trpc.io/docs/client/links#splitlink
          // uses the httpSubscriptionLink for subscriptions
          condition: (op) => op.type === "subscription",
          true: httpSubscriptionLink({
            url: getUrl(),
            transformer: superjson,
          }),
          false: httpBatchLink({
            transformer: superjson,
            url: getUrl(),

            headers: () => {
              const headers = new Headers();
              headers.set("x-trpc-source", "nextjs-react");
              return headers;
            },
          }),
        }),
      ],
    }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
