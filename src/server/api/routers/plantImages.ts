// Define the connectPlantWithImagesQuery configuration
export const connectPlantWithImagesQuery = {
  columns: { imageId: false, plantId: false, createdAt: false },
  with: { image: true },
} as const; // Ensure TypeScript infers exact typing

// Define the connectImageWithPlantsQuery configuration
export const connectImageWithPlantsQuery = {
  columns: { imageId: false, plantId: false, createdAt: false },
  with: { plant: true },
} as const; // Ensure TypeScript infers exact typing
