// src/app/[locale]/(protected)/dashboard/page.tsx:
import { auth } from "~/lib/auth";

export default async function Dashboard() {
  const session = await auth();
  if (!session) return <div>Not authenticated</div>;

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20">
      <>{JSON.stringify(session, null, 2)}</>
    </div>
  );
}
