// src/app/[locale]/(public)/public/timeline/page.tsx:
import SpinningLoader from "~/components/Layouts/loader";
import PublicPost from "~/components/features/Post/public-post";
import { api } from "~/lib/trpc/react";

export default function PublicTimelinePage() {
  const { data: posts, isLoading } = api.posts.getAll.useQuery();

  if (isLoading) {
    return <SpinningLoader />;
  }

  return (
    <div className="space-y-4">
      {posts?.map((post) => <PublicPost key={post.id} post={post} />)}
    </div>
  );
}
