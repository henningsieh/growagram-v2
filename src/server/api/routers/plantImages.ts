// Define the connectPlantImagesQuery configuration
export const withPlantImagesQuery = {
  columns: { imageId: false, plantId: false, createdAt: false },
  with: {
    image: true,
    // {
    //   columns: {
    //     id: true,
    //     createdAt: true,
    //     updatedAt: true,
    //     ownerId: true,
    //     imageUrl: true,
    //     cloudinaryAssetId: true,
    //     cloudinaryPublicId: true,
    //     captureDate: true,
    //     originalFilename: true,
    //   },
    // },
  },
} as const; // Ensure TypeScript infers exact typing
