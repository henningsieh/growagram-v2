"use client";

// src/app/[locale]/(public)/public/timeline/page.tsx:
import SpinningLoader from "~/components/atom/spinning-loader";
import PostCard from "~/components/features/Timeline/Post/post-card";
import { api } from "~/lib/trpc/react";

export default function PublicTimelinePage() {
  const { data: posts, isLoading } = api.updates.getAll.useQuery();

  if (isLoading) {
    return <SpinningLoader />;
  }

  return (
    <div className="space-y-4">
      {posts?.map((post) => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
