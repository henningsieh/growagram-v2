import { Suspense } from "react";

import InfiniteScrollLoader from "~/components/atom/infinite-scroll-loader";
import FollowingTimeline from "~/components/features/Timeline/following-timeline";

export default function FollowingTimelinePage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Suspense fallback={<InfiniteScrollLoader />}>
        <FollowingTimeline />
      </Suspense>
    </div>
  );
}
