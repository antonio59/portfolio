// Add type definitions for modules without type definitions
declare module "https://deno.land/std@0.177.0/http/server.ts" {
  export * from "node:http";
}

// Add path aliases for better module resolution
declare module "@/lib/config" {
  export * from "../../client/lib/config";
}

declare module "@/lib/supabase" {
  export * from "../../client/lib/supabase";
}

// Add global type declarations
declare namespace NodeJS {
  interface ProcessEnv {
    // Supabase
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;

    // Environment
    readonly NODE_ENV: "development" | "production" | "test";

    // Add other environment variables as needed
    readonly VITE_API_URL?: string;
    readonly VITE_GOOGLE_ANALYTICS_ID?: string;
  }
}

// Enable importing of image files in TypeScript
declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.jpeg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.gif" {
  const content: string;
  export default content;
}

declare module "*.webp" {
  const content: string;
  export default content;
}

declare module "*.avif" {
  const content: string;
  export default content;
}

declare module "*.svg" {
  import * as React from "react";
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement>
  >;
  const src: string;
  export default src;
}

// Add support for CSS Modules
declare module "*.module.css" {
  const classes: Readonly<Record<string, string>>;
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

declare module "*.module.styl" {
  const classes: Record<string, string>;
  export default classes;
}

// Add type declarations for JSON imports
declare module "*.json" {
  const value: unknown;
  export default value;
}

// Add type declarations for global variables
declare const __APP_VERSION__: string;

// Add type declarations for Vite's import.meta.env
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_API_URL?: string;
  readonly VITE_GOOGLE_ANALYTICS_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
