// src/types/assets.d.ts
declare module "*.svg" {
  import type { ComponentProps, FC } from "react";
  const content: FC<ComponentProps<"svg">>;
  export default content;
}
