import { Suspense } from "react";

import InfiniteScrollLoader from "~/components/atom/infinite-scroll-loader";
import PublicTimeline from "~/components/features/Timeline/public-timeline";

export default function TimelinePage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Suspense fallback={<InfiniteScrollLoader />}>
        <PublicTimeline />
      </Suspense>
    </div>
  );
}
