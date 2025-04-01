import * as React from "react";
// eslint-disable-next-line no-restricted-imports
import Link from "next/link";
import { HashtagIcon } from "@heroicons/react/24/outline";
import { twMerge } from "tailwind-merge";
import { CreateChannelDialog } from "~/app/Chat/channels/create-channel";
import { buttonVariants } from "~/components/button";
import { SignedIn, SignedOut } from "~/lib/auth/index";
import { api } from "~/lib/trpc/server";

export default async function Home() {
  const channels = await api.channel.list();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex h-full flex-col">
        <header className="p-4">
          <h1 className="text-3xl font-bold text-gray-950 dark:text-gray-50">
            tRPC SSE starter
          </h1>
          <p className="text-sm text-gray-700 dark:text-gray-400">
            Showcases Server-sent Events + subscription support
            <br />
            <a
              className="text-gray-700 underline dark:text-gray-400"
              href="https://github.com/trpc/examples-next-sse-chat"
              target="_blank"
              rel="noreferrer"
            >
              View Source on GitHub
            </a>
          </p>
        </header>

        <article className="space-y-2 p-4 text-sm text-gray-700 dark:text-gray-400">
          <h2 className="text-lg font-medium text-gray-950 dark:text-gray-50">
            Introduction
          </h2>
          <ul className="list-inside list-disc space-y-2">
            <li>Open inspector and head to Network tab</li>
            <li>All client requests are handled through HTTP</li>
            <li>
              We have a simple backend subscription on new messages that adds
              the newly added message to the current state
            </li>
          </ul>
        </article>

        <div className="mt-6 space-y-2 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-950 dark:text-gray-50">
              Channels
            </h2>
            <React.Suspense>
              <SignedIn>
                <CreateChannelDialog />
              </SignedIn>
              <SignedOut>
                <Link href="/api/auth/signin">Login</Link>
              </SignedOut>
            </React.Suspense>
          </div>
          <div className="flex w-full flex-col items-start">
            {channels.map((channel) => (
              <Link
                key={channel.id}
                className={twMerge(
                  buttonVariants({ variant: "link" }),
                  "w-full justify-start",
                )}
                href={`/Chat/channels/${channel.id}`}
              >
                <HashtagIcon className="mr-2 size-4 shrink-0" />
                <span className="truncate">{channel.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
