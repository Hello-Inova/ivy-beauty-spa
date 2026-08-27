/**
 * Whether the app is running in "modo demonstração" (static export, meant
 * for GitHub Pages). In this mode there is no server/database: the public
 * catalog is read from the bundled seed data, and booking/admin state is
 * simulated entirely in the browser via localStorage.
 *
 * This is a NEXT_PUBLIC_ env var, so its value is inlined at build time and
 * safe to read from both Server and Client Components.
 */
export const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a root-relative asset path with the configured basePath (GitHub Pages project sites are served from a sub-path). */
export function withBasePath(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${BASE_PATH}${path}`;
}
