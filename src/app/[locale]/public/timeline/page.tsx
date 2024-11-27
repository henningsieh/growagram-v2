// src/app/[locale]/(public)/public/timeline/page.tsx:
import { SessionProvider } from "next-auth/react";
import PostComponent from "~/components/features/Timeline/post";

export default function TimelinePage() {
  // const posts = await getPosts();

  return (
    <SessionProvider>
      <PostComponent id="aerg" />
      <PostComponent id="aerg" />
      <PostComponent id="aerg" />
      <PostComponent id="aerg" />
    </SessionProvider>
  );
}
