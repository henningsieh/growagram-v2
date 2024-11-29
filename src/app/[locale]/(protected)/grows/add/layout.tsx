import { api } from "~/lib/trpc/server";

export const metadata = {
  title: "SEO Title",
  description: "SEO Title",
};
export default async function AddGrowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prefetch the plants query - this will populate the cache
  await api.plant.getOwnPlants.prefetch();

  return <>{children}</>;
}
