import { UserProfile } from "~/components/features/UserProfile";
import { auth } from "~/lib/auth";
import { User } from "~/types";

export default async function Dashboard() {
  const session = await auth();

  const user = session?.user as User;
  if (!user) return null;

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20">
      <UserProfile user={user} />
    </div>
  );
}
