// src/types/cloudinary.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    CLOUDINARY_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
  }
}
