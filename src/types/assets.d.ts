// src/types/assets.d.ts
declare module "*.svg" {
  import * as React from "react";
  const content: React.FC<React.ComponentProps<"svg">>;
  export default content;
}
