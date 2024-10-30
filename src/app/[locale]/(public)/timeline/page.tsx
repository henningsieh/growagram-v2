import PostComponent from "~/components/features/timeline/post";

// This is a mock function to simulate fetching posts from an API
async function getPosts() {
  // In a real application, you would fetch this data from your API
  return [
    {
      id: "1",
      grow: {
        id: "g1",
        name: "Summer Grow 2023",
        startDate: new Date(2023, 5, 1),
      },
      plants: [
        { id: "p1", strain: "Blue Dream", growPhase: "Vegetative" },
        { id: "p2", strain: "OG Kush", growPhase: "Flowering" },
      ],
      createdAt: new Date(2023, 6, 15),
      feeding: true,
      watering: true,
      pruning: false,
    },
    // Add more mock posts as needed
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
