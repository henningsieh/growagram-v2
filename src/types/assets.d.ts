//src/types/assets.d.ts:

declare module "*.svg" {
  import React from "react";
  const SVGComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export default SVGComponent;
}

declare module "~/assets/flags/*-svgrepo-com.svg" {
  import React from "react";
  const FlagComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export default FlagComponent;
}
