import TimelineTabs from "~/components/features/Timeline/timeline-tabs";

export default function TimelinePage() {
  return (
    <div className="container mx-auto px-4">
      <TimelineTabs defaultTab="public" />
    </div>
  );
}
