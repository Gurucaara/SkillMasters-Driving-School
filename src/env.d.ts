// Type for the one Cloudflare Workers module the server code imports (src/lib/server-env.ts).
// The Worker's settings and secrets are typed there, in `ServerEnv`. We don't include Wrangler's
// full generated runtime types: they replace parts of the browser (DOM) types and break the
// type-checking of the pages' client-side scripts.
declare module 'cloudflare:workers' {
  export const env: Record<string, unknown>;
}
