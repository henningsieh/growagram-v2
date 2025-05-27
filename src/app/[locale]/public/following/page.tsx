import TimelineTabs from "~/components/features/Timeline/timeline-tabs";

export default function FollowingPage() {
  return (
    <div className="container mx-auto px-4">
      <TimelineTabs defaultTab="following" />
    </div>
  );
}
