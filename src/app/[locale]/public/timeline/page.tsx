"use client";

// src/app/[locale]/(public)/public/timeline/page.tsx:
import { useQuery } from "@tanstack/react-query";
import SpinningLoader from "~/components/atom/spinning-loader";
import PostCard from "~/components/features/Timeline/Post/post-card";
import { useTRPC } from "~/trpc/client";

export default function PublicTimelinePage() {
  const trpc = useTRPC();
  const { data: posts, isLoading } = useQuery(
    trpc.updates.getAll.queryOptions(),
  );

  if (isLoading) {
    return <SpinningLoader />;
  }

  return (
    <div className="space-y-4">
      {posts?.map((post) => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
