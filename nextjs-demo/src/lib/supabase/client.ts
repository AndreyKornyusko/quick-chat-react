import { createBrowserClient } from "@supabase/ssr";

let _client: ReturnType<typeof createBrowserClient> | null = null;

// Returns a singleton browser Supabase client.
// Created lazily on first call (not at module import time)
// so Next.js static build doesn't fail without env vars.
export function getSupabaseBrowserClient() {
  if (_client) return _client;
  _client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return _client;
}

// Proxy object — defers client creation until first property access.
// This allows importing `supabase` at the top of client components
// without triggering client creation at module evaluation time.
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_target, prop) {
    return Reflect.get(getSupabaseBrowserClient(), prop);
  },
});
