// Type definitions for modules without types
declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "*.module.scss" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "*.module.sass" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "*.module.less" {
  const classes: Record<string, string>;
  export default classes;
}

declare module "*.svg" {
  import * as React from "react";
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement>
  >;
  const src: string;
  export default src;
}

declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.webp";
declare module "*.avif";

// Add type definitions for any other file types as needed
