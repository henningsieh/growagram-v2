"use client";

// src/app/[locale]/(public)/public/timeline/page.tsx:
import PostComponent from "~/components/features/Timeline/post";

// This is a mock function to simulate fetching posts
// async function getPosts() {
//   return [
//     {
//       id: "1",
//       user: {
//         id: "u1",
//         name: "Django ElRey 🌱",
//         avatar: "/images/XYUV-dwm_400x400.jpg",
//       },
//       grow: {
//         id: "g1",
//         name: "Summer Summer Summer Summer Summer Grow 2023",
//         image: "/images/IMG_20241005_062601~2.jpg",
//         plants: [],
//         startDate: new Date(2024, 8, 12),
//         updatedAt: new Date(2024, 10, 30),
//         type: "outdoor" as const,
//       },
//       plants: [
//         { id: "p1", strain: "Blue Dream", growPhase: "Vegetative" },
//         { id: "p2", strain: "OG Kush", growPhase: "Flowering" },
//         { id: "p3", strain: "Cheese", growPhase: "Flowering" },
//         { id: "p4", strain: "Amnesia Haze", growPhase: "Harvested" },
//       ],
//       content:
//         "Today's update: The plants are showing great progress. Blue Dream is developing a strong structure, while OG Kush is starting to show its first flowers. Adjusted the nutrient mix for the flowering phase.",
//       images: [
//         "https://images.unsplash.com/photo-1503262167919-559b953d2408?q=95&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//         "https://images.unsplash.com/photo-1503262167919-559b953d2408?q=95&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//         "https://images.unsplash.com/photo-1503262167919-559b953d2408?q=95&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//         "https://images.unsplash.com/photo-1503262167919-559b953d2408?q=95&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//       ],
//       createdAt: new Date(2023, 6, 15),
//       feeding: true,
//       watering: true,
//       pruning: false,
//     },
//   ];
// }

const samplePost = {
  id: "1",
  user: {
    id: "user1",
    name: "Django ElRey 🌱",
    avatar: "/images/XYUV-dwm_400x400.jpg",
  },
  grow: {
    id: "grow1",
    name: "Summer Grow 2023",
    startDate: new Date("2023-06-01"),
    type: "outdoor" as const,
  },
  plants: [
    {
      id: "plant1",
      name: "Blue Dream",
      createdAt: new Date("2023-06-10"),
      updatedAt: new Date("2023-07-01"),
      ownerId: "user1",
      headerImageId: "img1",
      growId: "grow1",
      strainId: "strain1", // Assuming you have a strain ID for this plant
      startDate: new Date("2023-06-10"),
      seedlingPhaseStart: new Date("2023-06-10"),
      vegetationPhaseStart: new Date("2023-06-20"),
      floweringPhaseStart: new Date("2023-07-01"),
      harvestDate: null, // Assuming it hasn't been harvested yet
      curingPhaseStart: null, // Assuming it's not yet in the curing phase
      plantImages: [
        {
          image: {
            id: "img1",
            imageUrl: "/images/IMG_20241005_062601~2.jpg",
          },
        },
      ],
      strain: {
        id: "strain1",
        name: "Blue Dream",
        thcContent: 20, // Mock THC content
        cbdContent: 0.1, // Mock CBD content
        breeder: {
          id: "breeder1",
          name: "Breeder X",
        },
      },
      headerImage: {
        id: "img1",
        imageUrl: "/images/IMG_20241005_062601~2.jpg",
      },
    },
    {
      id: "plant2",
      name: "OG Kush",
      createdAt: new Date("2023-07-15"),
      updatedAt: new Date("2023-08-01"),
      ownerId: "user1",
      headerImageId: "img2",
      growId: "grow1",
      strainId: "strain2", // Assuming you have a strain ID for this plant
      startDate: new Date("2023-07-15"),
      seedlingPhaseStart: new Date("2023-07-15"),
      vegetationPhaseStart: new Date("2023-07-20"),
      floweringPhaseStart: new Date("2023-08-01"),
      harvestDate: null, // Assuming it hasn't been harvested yet
      curingPhaseStart: null, // Assuming it's not yet in the curing phase
      plantImages: [
        {
          image: {
            id: "img2",
            imageUrl: "/images/IMG_20241020_102123.jpg",
          },
        },
      ],
      strain: {
        id: "strain2",
        name: "OG Kush",
        thcContent: 18, // Mock THC content
        cbdContent: 0.2, // Mock CBD content
        breeder: {
          id: "breeder2",
          name: "Breeder Y",
        },
      },
      headerImage: {
        id: "img2",
        imageUrl: "/images/IMG_20241020_102123.jpg",
      },
    },
  ],
  createdAt: new Date(),
  trigger: "new_plant" as const,
};

export default function TimelinePage() {
  // const posts = await getPosts();

  return (
    <>
      <PostComponent id="aerg" />
      <PostComponent id="aerg" />
      <PostComponent id="aerg" />
      <PostComponent id="aerg" />
    </>
  );
}
