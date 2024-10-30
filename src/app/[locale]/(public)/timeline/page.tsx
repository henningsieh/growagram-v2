// src/app/[locale]/(public)/timeline/page.tsx:
import PostComponent from "~/components/features/timeline/post";

// This is a mock function to simulate fetching posts
async function getPosts() {
  return [
    {
      id: "1",
      user: {
        id: "u1",
        name: "GreenThumb",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      grow: {
        id: "g1",
        name: "Summer Summer Summer Summer Summer Grow 2023",
        startDate: new Date(2023, 5, 1),
        type: "outdoor" as const,
      },
      plants: [
        { id: "p1", strain: "Blue Dream", growPhase: "Vegetative" },
        { id: "p2", strain: "OG Kush", growPhase: "Flowering" },
        { id: "p3", strain: "Cheese", growPhase: "Flowering" },
        { id: "p4", strain: "Amnesia Haze", growPhase: "Harvested" },
      ],
      content:
        "Today's update: The plants are showing great progress. Blue Dream is developing a strong structure, while OG Kush is starting to show its first flowers. Adjusted the nutrient mix for the flowering phase.",
      images: [
        "https://images.unsplash.com/photo-1503262167919-559b953d2408?q=95&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1503262167919-559b953d2408?q=95&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1503262167919-559b953d2408?q=95&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1503262167919-559b953d2408?q=95&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      ],
      createdAt: new Date(2023, 6, 15),
      feeding: true,
      watering: true,
      pruning: false,
    },
  ];
}

export default async function TimelinePage() {
  const posts = await getPosts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Grow Timeline</h1>
      {posts.map((post) => (
        <PostComponent key={post.id} post={post} />
      ))}
    </div>
  );
}
