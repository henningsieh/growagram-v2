import { Chat } from "~/app/Chat/channels/[channelId]/chat";

import * as React from "react";

export default async function Home(
  props: Readonly<{ params: Promise<{ channelId: string }> }>,
) {
  const { channelId } = await props.params;

  return (
    <React.Suspense
      fallback={
        <div className="flex h-full flex-1 flex-row items-center justify-center italic">
          Loading....
        </div>
      }
    >
      <Chat channelId={channelId} />
    </React.Suspense>
  );
}
