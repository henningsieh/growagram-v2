import { redirect } from "next/navigation";

export default function FollowingPage() {
  // Redirect to the new following timeline route
  redirect("/public/timeline/following");
}
